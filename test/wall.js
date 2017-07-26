/* eslint-disable max-len,no-unused-expressions */
/* global CHAI */
'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const libs = require('./libs');
const parameters = require('../server/parameters');

describe('Publications sur le profil', function() {
  let users = null;
  let userJose = null;
  let userAdmin = null;
  before('drop friendlist', function(done) {
    libs.dropCollection(done, 'wall');
  });

  before('users', function(done) {
    libs.getUsers(function(data) {
      users = data;
      done();
    });
  });

  before('user jose', function() {
    userJose = users.find(function(user) {
      return user.email === 'jose@yopmail.com';
    });
  });

  before('user admin', function() {
    userAdmin = users.find(function(user) {
      return user.email === 'admin@yopmail.com';
    });
  });

  describe('publier un message', function() {

    it('unverified publie sur le profil de jose', function(done) {
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userJose.id}/walls`)
        .send({message: 'yolo', dateCreated: new Date()})
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('jose publie sur son profil', function(done) {
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userJose.id}/walls`)
        .set('Authorization', userJose.token)
        .send({message: 'message de jose', dateCreated: new Date()})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('admin publie sur le profil de jose ', function(done) {
      console.log(userJose);
      console.log(userAdmin);
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userJose.id}/walls`)
        .set('Authorization', userAdmin.token)
        .send({message: 'message de admin', dateCreated: new Date()})
        .end((err, res) => {
          console.log(res.body)
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
