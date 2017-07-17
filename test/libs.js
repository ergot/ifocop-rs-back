'use strict';
const configLocal = require('../server/config.local');
const MongoClient = require('mongodb').MongoClient;
console.log(configLocal);

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
