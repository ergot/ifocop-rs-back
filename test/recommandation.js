'use strict';
/* eslint-disable max-len,no-unused-expressions */
/* global CHAI */
const libs = require('./libs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Recommandation', function() {
  let users = null;
  let idJose = null;
  let tokenJose = null;
  let idJm = null;
  let idRoro = null;

  before('clear mailtrap', function(done){
    libs.clearMailTrap(done)
  })

  before('drop friendlist', function(done) {
    libs.dropCollection(done, 'friendsList');
  });

  before('get users', function(done) {
    libs.getUsers(function(data) {
      users = data;
      idJose = libs.findIn(users, 'email', 'jose@yopmail.com', 'id');
      tokenJose = libs.findIn(users, 'email', 'jose@yopmail.com', 'token');
      idJm = libs.findIn(users, 'email', 'jm@yopmail.com', 'id');
      idRoro = libs.findIn(users, 'email', 'roro@yopmail.com', 'id');
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
      // console.log(users)
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

  describe('Une notification est envoyée par mail à l’adresse du membre pour lui signaler la recommandation', function(){
    it('Envoie des emails de notifications', function(done){
      chai.request('https://mailtrap.io/api/v1')
        .get('/inboxes/214542/messages')
        .set('Api-Token', libs.parameters.mailtrap['Api-Token'])
        .end((err, res) => {
           console.log(res.body.length)
          expect(res).to.have.status(200);

          expect(res.body[0].from_email).to.equal('notification@ifocop-rs.com');
          expect(res.body[0].to_email).to.equal('roro@yopmail.com');
          expect(res.body[0].subject).to.equal('Une nouvelle reco !');
          done()
        });

    })
  })
});//

