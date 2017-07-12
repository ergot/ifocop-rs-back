/* eslint-disable max-len */
/* global CHAI */
'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const parameters = require('../server/parameters');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/ifocop_RS';

describe('Ajouter un utilisateur à la liste d’amis', function() {
  let friendList = [];
  describe('1. Le membre demandeur clique sur un nom de la liste.', function() {
    it('jm regarde la listes de membres valides', function(done) {
      chai.request(CHAI.urlRoot)
        .get('/api/myUsers')
        .set('Authorization', CHAI.users.getTokenByEmail('jm@yopmail.com'))
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.forEach((user) => {
            expect(user.emailVerified).to.equal(true);
            friendList.push(user);
          });
          done();
        });
    });
  });

  describe('2. Le membre choisi, receveur, est ajouté à la liste d’amis du membre', function() {
    let userRoro = null;
    before(function(done) {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection('myUser').find({'email': 'roro@yopmail.com'}).toArray(function(error, results) {
          userRoro = results[0];
          db.close();
          done();
        });
      });
    });
    let userJm = null;
    before(function(done) {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection('myUser').find({'email': 'jm@yopmail.com'}).toArray(function(error, results) {
          userJm = results[0];
          db.close();
          done();
        });
      });
    });

    it('jm envoie une friend request à roro', function(done) {
      chai.request(CHAI.urlRoot)
        .post('/api/friendsLists')
        .set('Authorization', CHAI.users.getTokenByEmail('jm@yopmail.com'))
        .send({receiver: userRoro._id})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('roro recois un email de notification', function(done){
      chai.request('https://mailtrap.io/api/v1')
        .get('/inboxes/214542/messages')
        .set('Api-Token', parameters.mailtrap['Api-Token'])
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body[0].from_email).to.equal('notification@ifocop-rs.com');
          expect(res.body[0].to_email).to.equal('roro@yopmail.com');
          done();
        });
    });

    it('jm ne peux pas renvoyer une deuxieme FR à roro', function(done) {
      chai.request(CHAI.urlRoot)
        .post('/api/friendsLists')
        .set('Authorization', CHAI.users.getTokenByEmail('jm@yopmail.com'))
        .send({receiver: userRoro._id})
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

    it('roro a une FR de la part de jm', function(done) {
      chai.request(CHAI.urlRoot)
        .get('/api/friendsLists')
        .set('Authorization', CHAI.users.getTokenByEmail('roro@yopmail.com'))
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body[0].receiver).to.equal(userRoro._id.toString());
          done();
        });
    });

    it('roro ne peux pas faire une FR a jm', function(done) {
      chai.request(CHAI.urlRoot)
        .post('/api/friendsLists')
        .set('Authorization', CHAI.users.getTokenByEmail('roro@yopmail.com'))
        .send({receiver: userJm._id})
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });
  });
});
