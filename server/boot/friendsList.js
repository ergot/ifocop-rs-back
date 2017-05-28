'use strict';

module.exports = function (app) {
  app.dataSources.mongoDs.automigrate('friendsList', function (err) {
    if (err) throw err;
  });
};
