/* eslint-disable max-len */
'use strict';
const colors = require('colors');
const MongoClient = require('mongodb').MongoClient;

module.exports = function(Friendslist) {
  let $this = Friendslist;

  Friendslist.beforeRemote('create', function(ctx, modelInstace, next) {
    // gestion de l'envoie d'une friend request
    if (ctx.req.baseUrl === '/api/friendsLists' & ctx.req.method === 'POST') {
      ctx.req.body.sender = ctx.req.accessToken.userId;

      const sender = ctx.req.accessToken.userId;
      const receiver = ctx.req.body.receiver;

      MongoClient.connect($this.app.get('mongo').url, function(err, db) {
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
                // @todo: Un mail est envoyé au membre choisi pour lui signaler l’invitation
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
  /**
   * Recupere la liste des amis et des FR en cours
   * @param idUser - sender or receiver
   * @param isConfirmed [boolean] - applique un filtre sur la collection ou pas si undefined( = loopback si pas préciser)
   * @param cb
   */
  Friendslist.getFriendship = function(idUser, isConfirmed, cb) {
    let filtres = null;
    if (isConfirmed === undefined) {
      filtres = {
        $or: [
          {sender: idUser},
          {receiver: idUser}],
      };
    } else {
      filtres = {
        $or: [
          {sender: idUser, isConfirmed},
          {receiver: idUser, isConfirmed}],
      };
    }

    MongoClient.connect($this.app.get('mongo').url, function(err, db) {
      if (err) throw err;
      db.collection('friendsList').find(filtres).toArray(function(err2, results) {
        db.close();
        if (err2) return cb(err2);
        // @todo: Un message est affiché pour indiquer que la demande a été confirmée
        cb(null, results);
      });
    });
  };

  Friendslist.remoteMethod('getFriendship', {
    description: 'Retrieves a user\'s list of friends',
    accepts: [
      {arg: 'idUser', type: 'string', required: true, description: 'l id de l user'},
      {arg: 'isConfirmed', type: 'boolean', description: 'Filtre sur le status de la PR, si vide prend toutes les PR'},
    ],
    http: {verb: 'get'},
    returns: {arg: 'friendship', type: 'array'},
  });
};
