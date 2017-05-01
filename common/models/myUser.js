'use strict';
var config = require('../../server/config.json');
var path = require('path');

module.exports = function (User) {
  //send verification email after registration
  User.afterRemote('create', function (context, userInstance, next) {
    console.log('> user.afterRemote triggered');

    //configuration de l email envoyer à l enregistrement
    var options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
      // template de l email: avec un href /myUsers/confirm?iud=XXXX qui permet de valider le compte
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: User
    };

    //envoie de l email
    userInstance.verify(options, function(err, response, next) {
      if (err) return next(err);

      console.log('> verification email sent:', response);

      //reponse http apres l envoie de l email
      context.res.sendStatus(200);
      //si besoin creer le template server/views/response.ejs
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
  User.on('resetPasswordRequest', function (info) {

    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password reset',
      html: html
    }, function (err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });
};
