"use strict";

const bcrypt = require('bcrypt');
const db = require('../db');

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

      const result = await db.query(
        `INSERT INTO users (username,
          password,
          first_name,
          last_name,
          phone)
          VALUES
          ($1, $2, $3, $4, $5)
          RETURNING username, password, first_name, last_name, phone`,
          [username, password, first_name, last_name, phone]
      );


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

    if (user){
      return (await bcrypt.compare(password, user.password) === true);
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
      FROM users`
    )
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
    
    // const messagesResult = await db.query(
    //   `SELECT m.id, m.body, m.sent_at, m.read_at, 
    //     to_user 
    //     FROM messages AS m
    //     JOIN users AS u ON m.from_username = u.username
    //         FROM (SELECT username, first_name, last_name, phone
    //           FROM users
    //           WHERE username = m.to_username) AS SUBQUERY
    //     WHERE u.username = $1`,
    //   [username]
    // );

    // const message = messagesResult.rows;

//git check

    // const userResult = await db.query(
    //   `SELECT username, first_name, last_name, phone
    //   FROM users
    //   WHERE username = $1`,
    //   []
    // );
    // const to_user = userResult.rows[0];

    // return {message}

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
