module.exports = function (Model, options) {

  Model.defineProperty('createdAt', { type: Date, default: '$now' });
  Model.defineProperty('updatedAt', { type: Date, default: '$now' });

  Model.beforeRemote('*.patchAttributes', function (context, unused, next) {
    const model = context.instance;
    model.updateAttribute('updatedAt', Date.now())
    return next();
  });

};
