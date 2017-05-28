'use strict';
const userFixture = require('./userFixture');
module.exports = function (app) {
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  // 'name' of your mongo connector, you can find it in datasource.json

  function setRole(roleName, users) {
    Role.create({
      name: roleName,
    }, function (err, role) {
      if (err) throw err;
      const toto = (function () {
        let data = [];
        users.forEach((user) => {
          data.push(
            {
              principalType: RoleMapping.USER,
              principalId: user.id,
            }
          );
        });
        return data;
      })();

      role.principals.create(toto, function (err, principal) {
        if (err) throw err;
        //console.log(principal);
      });
    });
  }

  // WARNING: Calling this function deletes all data! Use autoupdate() to preserve data.
  app.dataSources.mongoDs.automigrate('myUser', function (err) {
    if (err) throw err;

    app.models.myUser.create(userFixture, function (err, users) {
      if (err) throw err;
      setRole('admin', [users[0]]);
      users.splice(0, 1); // !splice retourne la valeur supprimé
      setRole('member', users);
    });
  });
};
