
module.exports = function(Model, opts = {}) {
	/*
		Requires these acl rules on model.json to work:

		{
		  "principalType": "ROLE",
		  "principalId": "$authenticated",
		  "permission": "ALLOW",
		  "property": "_find"
		},
    {
      "principalType": "ROLE",
      "principalId": "$authenticated",
      "permission": "ALLOW",
      "property": "_count"
    },
    {
      "principalType": "ROLE",
      "principalId": "$authenticated",
      "permission": "ALLOW",
      "property": "_patchOrCreate"
    }
	*/

  if (!opts.findAll) {
    Model.disableRemoteMethodByName('find');

    Model.remoteMethod('_find', {
      description: 'Limits results to records owned by the requesting user',
      accessType: 'READ',
      accepts: [
        {arg: 'filter', type: 'object', http: {source: 'query'}},
        {arg: 'options', type: 'object', http: 'optionsFromRequest'},
      ],
      returns: {arg: 'data', type: 'array', root: true},
      http: {verb: 'get', path: '/'},
    });
  }

  Model.disableRemoteMethodByName('count');
  Model.disableRemoteMethodByName('patchOrCreate');

  Model._find = function(filter, options = {}) {
    if (!options.accessToken) return Promise.resolve([]);
    if (!filter) {
      return Model.find({where: {userId: options.accessToken.userId}}); // return all alerts for user
    } else if (filter.where) {
      filter.where = Object.assign({}, filter.where, {userId: options.accessToken.userId}); // inject userId filter into provided where filter
      return Model.find(filter);
    } else {
      return Model.find(Object.assign({}, filter, {where: {userId: options.accessToken.userId}})); // inject where filter into filter
    }
  };

  Model.remoteMethod('_count', {
    description: 'Limits results to records owned by the requesting user',
    accessType: 'READ',
    isStatic: true,
    accepts: [
      {arg: 'where', type: 'object', http: {source: 'query'}},
      {arg: 'options', type: 'object', http: 'optionsFromRequest'},
    ],
    returns: {arg: 'data', type: 'array', root: true},
    http: {verb: 'get', path: '/count'},
  });

  Model._count = function(where, options = {}) {
    if (!options.accessToken) return Promise.resolve();
    let countPromise = !where ? Model.count({userId: options.accessToken.userId}) : Model.count(Object.assign({}, where, {userId: options.accessToken.userId}));
    return countPromise.then(c => {
      return {count: c};
    });
  };

  Model.remoteMethod('_patchOrCreate', {
    description: 'Patch an existing model instance or insert a new one into the data source',
    isStatic: true,
    accepts: [
      {arg: 'data', type: 'object', http: {source: 'body'}},
      {arg: 'options', type: 'object', http: 'optionsFromRequest'},
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'patch', path: '/'},
  });

  Model._patchOrCreate = function(data, options = {}) {
    const userId = options.accessToken ? options.accessToken.userId : null;
    if (!data.id) {
      return Model.create(data, options);
    }

    return Model.findById(data.id).then(instance => {
      if (instance && instance.userId.toString() !== userId.toString()) {
        let error = new Error('Authorization Required');
        error.status = 401;
        error.name = 'Error';
        error.code = 'AUTHORIZATION_REQUIRED';
        throw error;
      } else {
        return Model.patchOrCreate(data, options);
      }
    });
  };
};
