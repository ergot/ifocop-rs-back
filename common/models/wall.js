/* eslint-disable max-len */
'use strict';

module.exports = function(Wall) {
  Wall.observe('before save', function(ctx, next) {
    if (ctx.options.authorizedRoles.admin) {
      console.log('admin');
      return next();
    }

    const myUserId = ctx.instance.myUserId.toString();
    if (ctx.options.accessToken.userId === myUserId) {
      console.log('owner');
      return next();
    }

    if (ctx.options.authorizedRoles.member) {
      console.log(ctx.instance);

      const friendId = ctx.instance.friendId;

      // const filtre3 =
      //   {or: [
      //     {and: [{sender: friendId}, {receiver: myUserId}]},
      //     {and: [{sender: myUserId}, {receiver: friendId}]},
      //   ]};

      Wall.app.models.friendsList.find({where: {isConfirmed: true}}, function(err, users) {
        for (let i = 0; users[i]; i++) {
          if (users[i].sender === friendId && users[i].receiver === myUserId) {
            console.log('for1');
            return next();
          }
          if (users[i].sender === myUserId && users[i].receiver === friendId) {
            console.log('for2');
            return next();
          }
        }
        console.log('error');
        const error = new Error('>>>il faut etre ami afin de publier sur son mur<<<');
        error.status = 400;
        return next(error);
      });

      // next();
    }
  });
};
