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
  'password': 'password',
};
const userCompte = {
  email: 'jose@yopmail.com',
  password: 'password',
};

describe('myUser', function() {
  describe('admin', function() {
    it('login with admin compte', function(done) {
      chai.request(urlRoot)
        .post('/api/myUsers/login')
        .send(adminCompte)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.id, 'Pas de token').to.exist;
          adminToken = res.body.id;
          done();
        });
    });
    it('admin get all users', function(done) {
      chai.request(urlRoot)
        .get('/api/myUsers')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.equal(6);
          done();
        });
    });
  });
  describe('user', function() {
    it('login with user', function(done) {
      chai.request(urlRoot)
        .post('/api/myUsers/login')
        .send(userCompte)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.id, 'Pas de token').to.exist;
          userToken = res.body.id;
          done();
        });
    });
    it('member can get all users only Verified', function (done) {
      chai.request(urlRoot)
        .get('/api/myUsers')
        .set('Authorization', userToken)
        .end((err, res) => {
          res.body.forEach((user) => {
            expect(user.email).to.not.equal('unverified@yopmail.com');
          });
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
