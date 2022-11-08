"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");


describe("User Routes Test", function () {

    let testU1Token;
    let testU2Token;
  
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    const testU1 = {username: "test1"};
    testU1Token = jwt.sign(testU1, SECRET_KEY);

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+12155550000",
    });

    const testU2 = {username: "test2"};
    testU2Token = jwt.sign(testU2, SECRET_KEY);

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "test body"
    })
  });

//###################### USER ROUTES : GET "/" ALL USERS ######################

  test("can get all users", async function(){
    let resp = await request(app)
        .get("/users")
        .query({
            "_token": testU1Token
        });
    expect(resp.statusCode).toEqual(200);

    expect(resp.body).toEqual(
        {users: [
            {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            },
            {
            username: "test2",
            first_name: "Test2",
            last_name: "Testy2",
            }
        ]}
    )
  });

  test("cannot get all users with invalid token", async function(){
    let resp = await request(app)
        .get("/users")
        .query({
            "_token": "fake"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("cannot get all users with no token", async function(){
    let resp = await request(app)
        .get("/users");

    expect(resp.statusCode).toEqual(401);
  });


//###################### USER ROUTES : GET "/:username" SPECIFIC USER ######################

test("can get specific user", async function(){
    let resp = await request(app)
        .get("/users/test1")
        .query({
            "_token": testU1Token
        });
    expect(resp.statusCode).toEqual(200);

    expect(resp.body).toEqual(
        {user: 
            {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
            join_at: expect.any(String),
            last_login_at: expect.any(String)
            }
        }
    )
  });
});