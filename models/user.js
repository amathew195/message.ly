"use strict";

const bcrypt = require('bcrypt');
const { NotFoundError } = require("../expressError");
const db = require('../db');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    try{
      const result = await db.query(
        `INSERT INTO users (username,
            password,
            first_name,
            last_name,
            phone,
            join_at,
            last_login_at)
          VALUES
            ( $1, 
              $2, 
              $3, 
              $4, 
              $5, 
              current_timestamp, 
              current_timestamp) 
          RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]
      );
    } catch (err) {
      if (err instanceof IntegrityError) console.error("Invalid Username");
      else console.error(err);
    }

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      return await bcrypt.compare(password, user.password) === true;
    } else {
      return false;
    }

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such username: ${username}`);
  }


  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
      FROM users
      ORDER BY last_name, first_name`
    );
    const users = results.rows;
    return users;
  } 

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such username: ${username}`);

    return user;
  }


  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, 
              m.body, 
              m.sent_at, 
              m.read_at, 
              u.username, 
              u.first_name, 
              u.last_name, 
              u.phone
          FROM messages AS m
          JOIN users as u
              ON (m.to_username = u.username)
          WHERE m.from_username = $1`,
      [username]);

    const messages = result.rows.map(r => {
      return {
        id: r.id,
        to_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at
      }
    });

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const results = await db.query(
      `SELECT m.id, 
              m.body, 
              m.sent_at, 
              m.read_at, 
              u.username, 
              u.first_name, 
              u.last_name, 
              u.phone
          FROM messages AS m
          JOIN users as u
              ON (m.from_username = u.username)
          WHERE m.to_username = $1`,
      [username]);

    const messages = results.rows.map(r => {
      return {
        id: r.id,
        from_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at
      };
    });

    return messages;
  }
}


module.exports = User;
