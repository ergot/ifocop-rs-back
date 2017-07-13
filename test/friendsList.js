/* eslint-disable max-len,no-unused-expressions */
/* global CHAI */
'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const parameters = require('../server/parameters');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/ifocop_RS';

var userRoro = null;

describe('Ajouter un utilisateur à la liste d’amis', function() {
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

  describe('1. Le membre demandeur clique sur un nom de la liste.', function() {
    it('jm regarde la listes de membres valides', function(done) {
      chai.request(CHAI.urlRoot)
        .get('/api/myUsers')
        .set('Authorization', CHAI.users.getTokenByEmail('jm@yopmail.com'))
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.forEach((user) => {
            expect(user.emailVerified).to.equal(true);
          });
          done();
        });
    });
  });

  describe('3. Le membre demandeur est ajouté à la liste d’amis du receveur', function() {
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
  });

  describe('2. Le membre choisi, receveur, est ajouté à la liste d’amis du membre', function() {
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

  describe('4. Un mail est envoyé au membre choisi pour lui signaler l’invitation', function() {
    it('roro recois un email de notification', function(done) {
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
  });
});

describe('Valider une demande d’ajout à la liste d’amis', function() {
  let friendship = null;

  it('recupere tous les FR d un user', function(done) {
    chai.request(CHAI.urlRoot)
      .get('/api/friendsLists/getFriendship')
      .send({idUser: userRoro._id})
      .set('Authorization', CHAI.users.getTokenByEmail('jose@yopmail.com'))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.friendship).to.have.lengthOf(1);
        friendship = res.body.friendship;
        done();
      });
  });

  describe('1. Le membre receveur est ajouté à la liste d’amis du membre demandeur avec le statu', function() {
    it('roro accepte la fr de jm ', function(done) {
      expect(friendship[0].isConfirmed).to.be.false;
      chai.request(CHAI.urlRoot)
        .patch(`/api/friendsLists/${friendship[0]._id}`)
        .send({isConfirmed: true})
        .set('Authorization', CHAI.users.getTokenByEmail('roro@yopmail.com'))
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.be.equal(friendship[0]._id);
          done();
        });
    });
  });
});
