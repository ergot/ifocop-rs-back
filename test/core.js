/* eslint-disable no-unused-expressions */
/* global CHAI */
'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const urlRoot = 'http://localhost:3000';
let usersLogin = require('../server/boot/userFixture');
const MongoClient = require('mongodb').MongoClient;
const urlMongo = 'mongodb://localhost/ifocop_RS';

describe('Delete collections before test', function () {
  it('drop friendsLits', function () {
    MongoClient.connect(urlMongo, function (err, db) {
      db.collection('friendsList').drop(function (err) {
        if (err) throw err;
        db.close();
      });
    });
  });
});

describe('Get token', function () {
  usersLogin.forEach((user) => {
    it(`with ${user.email}`, function (done) {
      chai.request(urlRoot)
        .post('/api/myUsers/login')
        .send(user)
        .end(function (err, res) {
          expect(res).to.satisfy(() => {
            if (res.statusCode === 200) {
              expect(res.body.id, 'Pas de token').to.exist;
              user.token = res.body.id;
              return true;
            }
            if (res.statusCode === 401) {
              expect(res.body.id).to.be.undefinded;
              user.token = res.body.id;
              return true;
            }
          });
          done();
        });
    });
  });

  after(() => {
    global.CHAI = {};
    global.CHAI.urlRoot = 'http://localhost:3000';
    global.CHAI.users = usersLogin;
    global.CHAI.users.getTokenByEmail = (email) => {
      for (let i = 0; CHAI.users; i++) {
        if (CHAI.users[i].email === email) {
          return CHAI.users[i].token;
        }
      }
    };
  });
});
