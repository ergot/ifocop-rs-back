/* eslint-disable max-len */
'use strict';
const colors = require('colors');
const MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/ifocop_RS';

module.exports = function(Friendslist) {
  Friendslist.beforeRemote('create', function(ctx, modelInstace, next) {
    // gestion de l'envoie d'une friend request
    if (ctx.req.baseUrl === '/api/friendsLists' & ctx.req.method === 'POST') {
      ctx.req.body.sender = ctx.req.accessToken.userId;

      const sender = ctx.req.accessToken.userId;
      const receiver = ctx.req.body.receiver;

      let $this = Friendslist;

      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection('friendsList').find({
          $or: [
            {sender: sender, receiver: receiver},
            {sender: receiver, receiver: sender}],
        }).toArray(function(err2, results) {
          if (err2) throw err;
          db.close();
          if (results.length === 0) {
            $this.app.models.myUser.findById(receiver, function(err, user) {
              $this.app.models.Email.send({
                from: $this.app.get('email').from,
                to: user.email,
                subject: 'A new friend request !',
                html: 'All in the subject baka !',
              }, function(err) {
                if (err) return next(err);
                console.log('mail'.green);
                return next();
              });
            });
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
