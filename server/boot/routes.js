'use strict';

module.exports = function (app) {
  // Install a `/` route that returns server status
  var router = app.loopback.Router();
  router.get('/', app.loopback.status());

  router.get('/verified', function(req, res){
    res.render('verified');
  });

  server.use(router);
};
