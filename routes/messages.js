"use strict";

const Router = require("express").Router;
const router = new Router();

const { UnauthorizedError, BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Message = require('../models/message');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 * Middleware function (ensureLoggedIn) checks that a user is logged in.
 **/


router.get('/:id', ensureLoggedIn, async function (req, res, next) {
  const username = res.locals.user.username;
  const id = req.params.id;
  const message = await Message.get(id);
  const fromUsername = message.from_user.username;
  const toUsername = message.to_user.username;
  if (username !== fromUsername && username !== toUsername) {
    throw new UnauthorizedError();
  }

  return res.json(message);
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 * Middleware function (ensureLoggedIn) checks that a user is logged in.
**/


router.post('/', ensureLoggedIn, async function (req, res) {
  const fromUsername = res.locals.user.username;
  const toUsername = req.body.to_username;
  const msgBody = req.body.body;

  if (fromUsername === toUsername) throw new BadRequestError();

  const message = await Message.create({ fromUsername, toUsername, body: msgBody });

  return res.status(201).json(message);
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 * Middleware function (ensureLoggedIn) checks that a user is logged in.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
  const loggedInUsername = res.locals.user.username;
  const id = req.params.id;
  const message = await Message.get(id);
  const toUsername = message.to_user.username;

  if (loggedInUsername !== toUsername) {
    throw new UnauthorizedError();
  }

  const readMsg = await Message.markRead(id);

  return res.json(readMsg);
});

module.exports = router;