'use strict';
var config = require('../../server/config.json');
var path = require('path');
const async = require('async');

module.exports = function(User) {
  // send verification email after registration
  User.afterRemote('create', function(context, userInstance, next) {
    console.log('> user.afterRemote triggered');

    // configuration de l email envoyer à l enregistrement
    var options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
      // template de l email: avec un href /myUsers/confirm?iud=XXXX qui permet de valider le compte
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: User,
    };

    // envoie de l email
    userInstance.verify(options, function(err, response, next) {
      if (err) return next(err);

      console.log('> verification email sent:', response);

      // reponse http apres l envoie de l email
      context.res.sendStatus(200);
      // si besoin creer le template server/views/response.ejs
      // context.res.render('response', {
      //   title: 'Signed up successfully',
      //   content: 'Please check your email and click on the verification link ' -
      //   'before logging in.',
      //   redirectTo: '/',
      //   redirectToLinkText: 'Log in'
      // });
    });
  });

  // 3 send password reset link when requested
  User.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password reset',
      html: html,
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });
  /**
   * Returne le role de l'utilisateur connecté
   * @param accessToken {string} - access token de l user en cours
   * @param asyncDone {callback} - Callback de async
   * @return {array|Role} - Return un array du model lp Role
   */
  function getRole(accessToken, asyncDone) {
    const RoleMapping = User.app.models.RoleMapping;
    const Role = User.app.models.Role;
    if (!accessToken) {
      throw 'need access token';
    }

// eslint-disable-next-line max-len
    RoleMapping.find({where: {principalId: accessToken}}, function(err, roleMappings) {
      if (err) throw err;
      if (roleMappings.length > 1) throw 'User avec plusieurs roles non gérer';
      Role.find({where: {id: roleMappings[0].roleId}}, function(err, roles) {
        asyncDone(null, roles[0]);
      }
      );
    });
  };
  /**
   * Change le filtre ,pour un get myUser du role user, pour avoir que les
   * users avec un email valide
   */
  User.beforeRemote('find', function(ctx, modelInstance, next) {
    if (ctx.req.baseUrl === '/api/myUsers' & ctx.req.method === 'GET') {
      async.series([
        function(asyncDone) {
          getRole(ctx.req.accessToken.userId, asyncDone);
        },
      ], function(err, results) {
        if (results[0].name === 'member') {
          ctx.args.filter = {where: {emailVerified: true}};
        }
        next();
      });
    } else {
      next();
    }
  });
};
