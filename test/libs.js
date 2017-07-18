'use strict';
const configLocal = require('../server/config.local');
const MongoClient = require('mongodb').MongoClient;
const users = require('../server/boot/userFixture');
const async = require('async');



/**
 * Ajoute l id aux users
 * @param users
 */
function addIdUsers(users) {
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
  });
}

addIdUsers(users);

function addFriendsList(done, senderId, receiverId, isConfirmed) {
  MongoClient.connect(configLocal.mongo.url, function(err, db) {
    if (err) throw err;
    const dataInsert = {
      'sender': senderId,
      'receiver': receiverId,
      'isConfirmed': isConfirmed || false,
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

module.exports = {
  addFriendsList,
  dropCollection,
};
