'use strict';
const configLocal = require('../server/config.local');
const MongoClient = require('mongodb').MongoClient;
const users = require('../server/boot/userFixture');
const async = require('async');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const parameters = require('../server/parameters');

/**
 * Ajoute l id aux users
 * @param users
 */
function setIdUsers(callbackMaster, users) {
  async.each(users, function(user, callback) {
    MongoClient.connect(configLocal.mongo.url, function(err, db) {
      if (err) throw err;
      const query = {email: user.email};
      db.collection('myUser').find(query).toArray(function(err, result) {
        if (err) throw err;
        user.id = result[0]._id.toString();
        db.close();
        callback();
      });
    });
  }, function(err) {
    if (err) throw err;
    callbackMaster(null);
  });
}

function setTokenUsers(callbackMaster, users) {
  async.each(users, function(user, callback) {
    chai.request('http://localhost:3000')
      .post('/api/myUsers/login')
      .send(user)
      .end(function(err, res) {
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
        callback();
      });
  }, function(err) {
    if (err) throw err;
    callbackMaster(null);
  });
}

/**
 * Recupere les users
 * @param callback - Faire une callback maison pour recupere la valeur dans les tests
 */
function getUsers(callback) {
  async.parallel([
    function(callback) {
      setIdUsers(callback, users);
    },
    function(callback) {
      setTokenUsers(callback, users);
    },
  ], function(err) {
    if (err) throw err;
    callback(users);
  });
}

function addFriendsList(done, senderId, receiverId, isConfirmed, idReco) {
  MongoClient.connect(configLocal.mongo.url, function(err, db) {
    if (err) throw err;
    const dataInsert = {
      'sender': senderId,
      'receiver': receiverId,
      'isConfirmed': isConfirmed || false,
      'idReco': idReco || null,
    };
    db.collection('friendsList').insertOne(dataInsert, function(error, result) {
      db.close();
      if (error) throw error;
      if (done) done();
    });
  });
}

function dropCollection(done, collectionName) {
  MongoClient.connect(configLocal.mongo.url, function(err, db) {
    db.collection(collectionName).drop(function(err) {
      if (err) throw err;
      db.close();
      done();
    });
  });
}

/**
 * Recherche dans une collection
 * @param data - une collection
 * @param where -  la propriété de la collection
 * @param equal - la valeur attendus de la propriété
 * @param target - la propriete à retourner
 * @returns {*}
 */
function findIn(data, where, equal, target) {
  for (let i = 0; data; i++) {
    if (data[i][where] === equal) {
      return data[i][target];
    }
  }
}

function clearMailTrap(done) {
  chai.request('https://mailtrap.io/api/v1')
    .patch('/inboxes/214542/clean')
    .set('Api-Token', parameters.mailtrap['Api-Token'])
    .end(function(err, res) {
      expect(res).to.have.status(200);
      done();
    });
}

module.exports = {
  host: {url: 'http://localhost:3000'},
  parameters,
  configLocal,
  addFriendsList,
  dropCollection,
  getUsers,
  findIn,
  clearMailTrap,
};
