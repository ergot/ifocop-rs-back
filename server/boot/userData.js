'use strict';
var async = require('async');
module.exports = function(app) {
  // 'name' of your mongo connector, you can find it in datasource.json

  // WARNING: Calling this function deletes all data! Use autoupdate() to preserve data.
  app.dataSources.mongoDs.automigrate('myUser', function(err) {
    if (err) throw err;

    app.models.myUser.create([{
      email: 'admin@ifocop.com',
      password: 'admin'
    }, {
      email: 'jose@ifocop.com',
      password: 'jose'
    }], function(err, users) {
      if (err) throw err;
      console.log('Models created: \n', users);
    });
  });

};
