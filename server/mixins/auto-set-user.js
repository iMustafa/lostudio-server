module.exports = function (Model) {
  Model.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance && ctx.options.accessToken) {
      if (ctx.options.accessToken) ctx.instance.userId = ctx.options.accessToken.userId;
    }
    next();
  });
};