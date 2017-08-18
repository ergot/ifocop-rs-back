'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var app = module.exports = loopback();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(loopback.token());

// app.use(function (req, res, next) {
//   let sslUrl;
//
//   if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
//
//     sslUrl = ['https://tranquil-inlet-21479.herokuapp.com', req.url].join('');
//     return res.redirect(sslUrl);
//   }
//
//   return next();
// });

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
