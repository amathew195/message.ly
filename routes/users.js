"use strict";

const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 * Middleware function (ensureLoggedIn) checks that a user is logged in.
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  const users = await User.all();
  return res.json({users});
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 * Middleware function (ensureCorrectUser) checks that correct user is logged in.
**/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  const user = await User.get(username);
  console.log(user.join_at, "<<<<<<<<<<<<<<<JOIN")
  console.log(typeof user.join_at, "<<<<<<<<<Type")
  return res.json({user});
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 * Middleware function (ensureCorrectUser) checks that correct user is logged in.
 **/

router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  const messages = await User.messagesTo(username);
  return res.json({messages});
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *  Middleware function (ensureCorrectUser) checks that correct user is logged in.
 **/

router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  const messages = await User.messagesFrom(username);
  return res.json({messages});
});

module.exports = router;



