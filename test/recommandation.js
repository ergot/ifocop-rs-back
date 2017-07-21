'use strict';
/* eslint-disable max-len,no-unused-expressions */
/* global CHAI */
const libs = require('./libs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const MongoClient = require('mongodb').MongoClient;

describe('Recommandation', function() {
  let users = null;
  let idJose = null;
  let tokenJose = null;
  let tokenJm = null;
  let tokenRoro = null;
  let idJm = null;
  let idRoro = null;
  let idSam = null;

  before('clear mailtrap', function(done) {
    libs.clearMailTrap(done);
  });

  before('drop friendlist', function(done) {
    libs.dropCollection(done, 'friendsList');
  });

  before('get users', function(done) {
    libs.getUsers(function(data) {
      users = data;
      idJose = libs.findIn(users, 'email', 'jose@yopmail.com', 'id');
      tokenJose = libs.findIn(users, 'email', 'jose@yopmail.com', 'token');
      tokenJm = libs.findIn(users, 'email', 'jm@yopmail.com', 'token');
      tokenRoro = libs.findIn(users, 'email', 'roro@yopmail.com', 'token');
      idJm = libs.findIn(users, 'email', 'jm@yopmail.com', 'id');
      idRoro = libs.findIn(users, 'email', 'roro@yopmail.com', 'id');
      idSam = libs.findIn(users, 'email', 'sam@yopmail.com', 'id');
      done();
    });
  });

  it('jose est ami avec jm', function(done) {
    libs.addFriendsList(done, idJose, idJm, true);
  });
  it('jose est ami avec roro', function(done) {
    libs.addFriendsList(done, idJose, idRoro, true);
  });

  describe('Une liste de sélection s’affiche avec la liste d’amis possédant les tatut «confirmé».', function() {
    it('jose a roro et jm en amie confirmé', function(done) {
      chai.request(libs.host.url)
        .get('/api/friendsLists/getFriendship')
        .set('Authorization', tokenJose)
        .send({idUser: idJose, isConfirmed: true})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.friendship.length).to.be.equal(2);
          expect(res.body.friendship[0].isConfirmed).to.be.equal(true);
          done();
        });
    });
  });

  describe('Si le membre sélectionne un ami, celui-ci est ajouté à la liste\'d’amis de l’,', function() {
    it('jose reco roro à jm', function(done) {
      chai.request(libs.host.url)
        .post('/api/friendsLists')
        .set('Authorization', tokenJose)
        .send({sender: idJm, receiver: idRoro, idReco: idJose})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('jose ne peut pas refaire la meme reco', function(done) {
      chai.request(libs.host.url)
        .post('/api/friendsLists')
        .set('Authorization', tokenJose)
        .send({sender: idJm, receiver: idRoro, idReco: idJose})
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });
  });

  describe('Une notification est envoyée par mail à l’adresse du membre pour lui signaler la recommandation', function() {
    it('Envoie des emails de notifications', function(done) {
      chai.request('https://mailtrap.io/api/v1')
        .get('/inboxes/214542/messages')
        .set('Api-Token', libs.parameters.mailtrap['Api-Token'])
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body[0].from_email).to.equal('notification@ifocop-rs.com');
          expect(res.body[0].to_email).to.equal('roro@yopmail.com');
          expect(res.body[0].subject).to.equal('Une nouvelle reco !');
          done();
        });
    });
  });

  describe('Valider une recommandation d’ajout à la liste d’amis', function() {
    let idFr = null;
    it('jm vois une FR qui est une reco', function(done) {
      chai.request(libs.host.url)
        .get('/api/friendsLists/getFriendShip')
        .set('Authorization', tokenJm)
        .send({idUser: idJm})
        .end((err, res) => {
          let totalReco = 0;
          res.body.friendship.forEach((friend) => {
            if (friend.idReco) {
              expect(friend.isConfirmed).to.be.false;
              expect(friend.idReco).to.exist;
              idFr = friend._id;
              totalReco++;
            }
          });
          expect(totalReco).to.equal(1);
          done();
        });
    });

    it('jm accepte la reco', function(done) {
      chai.request(libs.host.url)
        .patch(`/api/friendsLists/${idFr}`)
        .send({isConfirmed: true})
        .set('Authorization', tokenJm)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.be.equal(idFr);
          expect(res.body.isConfirmed).to.be.equal(true);
          done();
        });
    });
  });

  describe('Ignorer une recommandation d’ajout à la liste d’amis', function() {
    before('reco jose: roro - sam', function(done) {
      libs.addFriendsList(done, idRoro, idSam, false, idJose);
    });

    let frRoro = null;
    before(function(done) {
      MongoClient.connect(libs.configLocal.mongo.url, function(err, db) {
        if (err) throw err;
        db.collection('friendsList').insertOne({
          'sender': idRoro,
          'receiver': idSam,
          'isConfirmed': false,
          'idReco': idJose,

        }, function(error, result) {
          if (error) throw error;
          frRoro = result.ops[0];
          db.close();
          done();
        });
      });
    });

    it('roro delete la reco avec sam', function(done) {
      chai.request(libs.host.url)
        .delete(`/api/friendsLists/${frRoro._id.toString()}`)
        .set('Authorization', tokenRoro)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.count).to.equal(1);
          done();
        });
    });
  });
});//

