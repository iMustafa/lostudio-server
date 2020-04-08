'use strict';

module.exports = function (app) {
  const { Role, RoleMapping, user } = app.models

  RoleMapping.belongsTo(user)
  user.hasMany(RoleMapping, { foreignKey: 'principalId' })
  Role.hasMany(user, { through: RoleMapping, foreignKey: 'roleId' })

  const rolesNames = ['personal', 'organization']
  const roles = rolesNames.map(role => { return { name: role } })

  const createRole = async role => {
    Role.findOrCreate(role, role, (err, instance, created) => {
      if (err) return err
      return instance
    })
  }

  Promise
    .all(
      roles.map(role => createRole(role))
    )
    .then(([personal, organization]) => {
      console.log('>> Created Roles')
    })
    .catch(err => {
      console.log(err)
    })

}