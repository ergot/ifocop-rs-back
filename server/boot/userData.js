'use strict';
var async = require('async');
module.exports = function (app) {
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  // 'name' of your mongo connector, you can find it in datasource.json

  // WARNING: Calling this function deletes all data! Use autoupdate() to preserve data.
  app.dataSources.mongoDs.automigrate('myUser', function (err) {
    if (err) throw err;

    app.models.myUser.create([{
      email: 'admin@yopmail.com',
      password: 'admin',
      verificationToken: null,
      emailVerified: true,
    }, {
      email: 'jose@yopmail.com',
      password: 'jose',
      verificationToken: null,
      emailVerified: true,
    }, {
      email: 'user1@yopmail.com',
      password: 'user',
      verificationToken: null,
      emailVerified: true,
    }, {
      email: 'user2@yopmail.com',
      password: 'user',
      verificationToken: null,
      emailVerified: true,
    }], function(err, users) {
      if (err) throw err;
      console.log('Models created: \n', users);

      //create the admin role
      Role.create({
        name: 'admin',
      }, function(err, role) {
        if (err) throw err;

        console.log('Created role:', role);

        //make admin an admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[0].id,
        }, function(err, principal) {
          if (err) throw err;

          console.log('Created principal:', principal);
        });
      });

    });
  });

};
