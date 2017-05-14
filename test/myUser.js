'use strict';
/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const urlRoot = 'http://localhost:3000';
let adminToken = null;
let userToken = null;
const adminCompte = {
  'email': 'admin@yopmail.com',
  'password': 'admin',
};
const userCompte = {
  email: 'jose@yopmail.com',
  password: 'jose',
};

describe('myUser', function () {
  describe('admin', function () {
    it('login with admin compte', function (done) {
      chai.request(urlRoot)
        .post('/api/myUsers/login')
        .send(adminCompte)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.id, 'Pas de token').to.exist;
          adminToken = res.body.id;
          done();
        });
    });
    it('admin get all users', function (done) {
      chai.request(urlRoot)
        .get('/api/myUsers')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body[0].email).to.exist;
          done();
        });
    });
  });
  describe('user', function () {
    it('login with user', function (done) {
      chai.request(urlRoot)
        .post('/api/myUsers/login')
        .send(userCompte)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.id, 'Pas de token').to.exist;
          userToken = res.body.id;
          done();
        });
    });
    it('user can get all users', function (done) {
      chai.request(urlRoot)
        .get('/api/myUsers')
        .set('Authorization', userToken)
        .end((err, res) => {
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body[0].email).to.exist;
          done();
        });
    });
  });
});
