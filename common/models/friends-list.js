/* eslint-disable max-len */
'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/ifocop_RS';

module.exports = function (Friendslist) {
  Friendslist.beforeRemote('create', function (ctx, modelInstace, next) {
    if (ctx.req.baseUrl === '/api/friendsLists' & ctx.req.method === 'POST') {
      ctx.req.body.sender = ctx.req.accessToken.userId;

      const sender = ctx.req.accessToken.userId;
      const receiver = ctx.req.body.receiver;

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        db.collection('friendsList').find({sender: sender, receiver: receiver}).toArray(function (err2, results) {
          if (err2) throw err;
          db.close();
          if (results.length === 0) {
            next();
          } else {
            const error = new Error('Une friend request est déja en cours');
            error.status = 409;
            return next(error);
          }
        });
      });
    } else {
      next();
    }
  });
};
