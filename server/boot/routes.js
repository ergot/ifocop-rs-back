'use strict';

module.exports = function (app) {
  // Install a `/` route that returns server status
  const router = app.loopback.Router();
  const User = app.models.myUser;

  router.get('/', function (req, res) {
    res.render('login');
  });

  router.get('/verified', function(req, res){
    res.render('verified');
  });

  // 2/ send an email with instructions to reset an existing user's password
  app.post('/request-password-reset', function (req, res, next) {

    User.resetPassword({
      email: req.body.email
    }, function (err) {
      if (err) return res.status(401).send(err);

      res.render('response', {
        title: 'Password reset requested',
        content: 'Check your email for further instructions',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });

  //3 B show password reset form
  app.get('/reset-password', function (req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    res.render('password-reset', {
      accessToken: req.accessToken.id
    });
  });

  //reset the user's pasword
  app.post('/reset-password', function (req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);

    //verify passwords match
    if (!req.body.password ||
      !req.body.confirmation ||
      req.body.password !== req.body.confirmation) {
      return res.sendStatus(400, new Error('Passwords do not match'));
    }

    // 5
    User.findById(req.accessToken.userId, function (err, user) {
      if (err) return res.sendStatus(404);
      user.updateAttribute('password', req.body.password, function (err, user) {
        if (err) return res.sendStatus(404);
        console.log('> password reset processed successfully');
        res.render('response', {
          title: 'Password reset success',
          content: 'Your password has been reset successfully',
          redirectTo: '/',
          redirectToLinkText: 'Log in'
        });
      });
    });
  });

  app.use(router);
};
