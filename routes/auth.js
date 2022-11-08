"use strict";

const { BadRequestError, UnauthorizedError } = require("../expressError");


const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const JWT_OPTIONS = { expiresIn : 3600 }; 

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next){
    if ( req.body === undefined ) throw new BadRequestError();

    const { username, password } = req.body;

    console.log(await User.authenticate(username, password) === true, "___________________________________AUTHENTICATE________")
    if(await User.authenticate(username, password) === true){
        const token = jwt.sign( { username } , SECRET_KEY );
        return res.json( { token } );
    } else {
        throw new UnauthorizedError("Invalid user/password");
    }

})


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function(req, res, next) {
    if ( req.body === undefined ) throw new BadRequestError();

    const user = await User.register(req.body);

    if(user){
        let payload = { username : user.username}
        const token = jwt.sign( payload, SECRET_KEY );
        return res.json( { token } );
    } else {
        throw new BadRequestError("Invalid registration");
    }
})

module.exports = router;