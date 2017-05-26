/* eslint-disable max-len */
'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/ifocop_RS';

describe('Ajouter un utilisateur à la liste d’amis', function () {
  let friendList = [];
  describe('1. Le membre demandeur clique sur un nom de la liste.', function () {
    it('jm regarde la listes de membres valides', function (done) {
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

  describe('2. Le membre choisi, receveur, est ajouté à la liste d’amis du membre', function () {
    let userRoro;
    before(function (done) {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        db.collection('myUser').find({'email': 'roro@yopmail.com'}).toArray(function (error, results) {
          userRoro = results[0];
          db.close();
          done();
        });
      });
    });

    it('jm envoie une friend request à roro', function (done) {
      chai.request(CHAI.urlRoot)
        .post('/api/friendsLists')
        .set('Authorization', CHAI.users.getTokenByEmail('jm@yopmail.com'))
        .send({sender: userRoro._id})
        .end((err, res) => {
          // console.log(res.body.error)
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});

