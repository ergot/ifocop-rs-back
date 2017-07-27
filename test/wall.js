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
  let userRoro = null;
  let userSam = null;

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

  before('user roro', function() {
    userRoro = users.find(function(user) {
      return user.email === 'roro@yopmail.com';
    });
  });
  before('user sam', function() {
    userSam = users.find(function(user) {
      return user.email === 'sam@yopmail.com';
    });
  });

  describe('publier un message', function() {
    it('unverified publie pas sur le profil de jose', function(done) {
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
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userJose.id}/walls`)
        .set('Authorization', userAdmin.token)
        .send({message: 'message de admin', dateCreated: new Date()})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('publier un message sur le profil d un ami', function() {
    before('jose ami avec roro', function(done) {
      libs.mongo.client.connect(libs.mongo.url, function(err, db) {
        if (err) throw err;
        db.collection('friendsList').insertOne({
          'sender': userJose.id,
          'receiver': userRoro.id,
          'isConfirmed': true,
        }, function(error, result) {
          if (error) throw error;
          db.close();
          done();
        });
      });
    });

    it('roro poste un message sur le mur de jose', function(done) {
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userJose.id}/walls`)
        .set('Authorization', userRoro.token)
        .send({message: 'message de roro sur le mur de jose', dateCreated: new Date(), friendId: userRoro.id})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('l admin poste un message sur le mur de jose', function(done) {
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userJose.id}/walls`)
        .set('Authorization', userAdmin.token)
        .send({message: 'message de l admin sur le mur de jose', dateCreated: new Date(), friendId: userAdmin.id})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('publier un message sur le profil de n importe qui', function() {
    it('jose peut pas publie sur le mur de sam', function(done) {
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userSam.id}/walls`)
        .set('Authorization', userJose.token)
        .send({message: 'message de jose sur le mur de sam', dateCreated: new Date(), friendId: userJose.id})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('admin peut publie sur le mur de sam', function(done) {
      chai.request(libs.host.url)
        .post(`/api/myUsers/${userSam.id}/walls`)
        .set('Authorization', userAdmin.token)
        .send({message: 'message de l admin sur le mur de sam', dateCreated: new Date(), friendId: userAdmin.id})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  })
});//
