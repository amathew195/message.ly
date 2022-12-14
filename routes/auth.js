"use strict";

const { BadRequestError, UnauthorizedError } = require("../expressError");


const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const JWT_OPTIONS = { expiresIn: 3600 };

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {

    if (req.body === undefined) throw new BadRequestError();

    const { username, password } = req.body;

    if (await User.authenticate(username, password) === true) {
        const token = jwt.sign({ username }, SECRET_KEY);
        await User.updateLoginTimestamp(username)
        return res.json({ token });
    } else {
        throw new UnauthorizedError("Invalid user/password");
    }
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
    if (req.body === undefined) throw new BadRequestError();

    const { username } = await User.register(req.body);

    const token = jwt.sign({ username }, SECRET_KEY);
    return res.status(201).json({ token });

});

module.exports = router;