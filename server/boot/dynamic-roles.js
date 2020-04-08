'use strict'

module.exports = function (app) {
  const { Role, DashboardRoleMapping } = app.models

  Role.registerResolver('dashboardEditor', (role, context, cb) => {
    if (context.modelName !== 'Dashboard')
      return process.nextTick(() => cb(null, false))

    const userId = context.accessToken.userId
    const dashboardId = context.modelId

    if (!userId || !dashboardId)
      return process.nextTick(() => cb(null, false))

    DashboardRoleMapping.findOne({
      where: {
        and: [
          { collaboratorId: userId },
          { dashboardId }
        ]
      }
    }, (err, permission) => {
      if (err) return cb(err)
      if (permission && permission.editor)
        return cb(null, true)

      return cb(null, false)
    })
  })

  Role.registerResolver('dashboardViewer', (role, context, cb) => {
    if (context.modelName !== 'Dashboard')
      return process.nextTick(() => cb(null, false))

    const userId = context.accessToken.userId
    const dashboardId = context.modelId

    if (!userId || !dashboardId)
      return process.nextTick(() => cb(null, false))

    DashboardRoleMapping.findOne({
      where: {
        and: [
          { collaboratorId: userId },
          { dashboardId }
        ]
      }
    }, (err, permission) => {
      if (err) return cb(err)
      if (permission && permission.viewer)
        return cb(null, true)

      return cb(null, false)
    })
  })
}