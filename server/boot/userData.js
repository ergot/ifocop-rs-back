'use strict';
module.exports = function (app) {
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  // 'name' of your mongo connector, you can find it in datasource.json

  // WARNING: Calling this function deletes all data! Use autoupdate() to preserve data.
  app.dataSources.mongoDs.automigrate('myUser', function (err) {
    if (err) throw err;

    app.models.myUser.create([{
      email: 'admin@yopmail.com',
      password: 'password',
      verificationToken: null,
      emailVerified: true,
    }, {
      email: 'jose@yopmail.com',
      password: 'password',
      verificationToken: null,
      emailVerified: true,
    }, {
      email: 'unverified@yopmail.com',
      password: 'password',
      verificationToken: null,
      emailVerified: false,
    }, {
      email: 'jm@yopmail.com',
      password: 'password',
      verificationToken: null,
      emailVerified: true,
    }, {
      email: 'roro@yopmail.com',
      password: 'password',
      verificationToken: null,
      emailVerified: true,
    }], function(err, users) {
      if (err) throw err;
      // create the admin role
      Role.create({
        name: 'admin',
      }, function(err, role) {
        if (err) throw err;
        // make admin an admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[0].id,
        }, function(err, principal) {
          if (err) throw err;
        });
      });

      // create the member role
      Role.create({
        name: 'member',
      }, function (err, role) {
        if (err) throw err;
        // make users[1] as member
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[1].id,
        }, function (err, principal) {
          if (err) throw err;
        });

        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[2].id,
        }, function (err, principal) {
          if (err) throw err;
        });
      });
    });
  });
};
