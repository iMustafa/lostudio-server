'use strict';

module.exports = function (Dashboard) {

  Dashboard.beforeRemote('*.__create__dashboardRoleMappings', (ctx, instance, _) => new Promise(async (resolve, reject) => {
    try {
      const { DashboardRoleMapping } = Dashboard.app.models
      const { email } = ctx.args.data
      const oldInvitation = await DashboardRoleMapping.findOne({ email })
      if (oldInvitation) {
        reject({ message: `You already sent an invitation to ${email}` })
      } else {
        resolve()
      }
    } catch (e) {
      console.log(e)
      reject(e)
    }
  }))

  Dashboard.afterRemote('*.__create__dashboardRoleMappings', (ctx, instance, _) => new Promise(async (resolve, reject) => {
    try {
      const { user } = Dashboard.app.models
      const { userId } = ctx.args.options.accessToken
      const { editor, email } = instance
      const type = editor ? `edit` : 'view'

      const organization = await user.findById(userId)
      const collaborator = await user.findOne({ where: { email } })
      const dashboard = await instance.dashboard.get()

      if (collaborator) {
        await instance.updateAttributes({ organizationId: organization.id, collaboratorId: collaborator.id, sent: true })
        await collaborator.notifications.create({
          seen: false,
          message: `${organization.id} added you to ${type} ${dashboard.title} dashboard.`,
          userId: collaborator.id,
          type: "Dashboard Collaboration"
        })
      } else {
        await instance.updateAttributes({ organizationId: organization.id })
      }

      resolve(instance)
    } catch (e) {
      console.log(e)
      reject(e)
    }
  }))

  Dashboard.remoteMethod('collaborations', {
    description: 'Get My Dashboards',
    accessType: 'READ',
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/collaborations' }
  })

  Dashboard.collaborations = (options, req) => new Promise(async (resolve, reject) => {
    try {
      const { userId } = options.accessToken
      const { DashboardRoleMapping } = Dashboard.app.models
      const permissions = await DashboardRoleMapping.find({ where: { collaboratorId: userId }, include: "dashboard" })
      const dashboards = permissions.map(permission => {
        const { title, description, id, userId } = permission.dashboard()
        const { editor, viewer } = permission
        return { title, description, id, userId, permissions: { editor, viewer } }
      })
      resolve(dashboards)
    } catch (e) {
      reject(e)
    }
  })

  Dashboard.remoteMethod('collaborators', {
    description: 'Get Collaborating Users to this dashboard',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/collaborators' }
  })

  Dashboard.prototype.collaborators = function (options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { DashboardRoleMapping } = Dashboard.app.models
        const permissions = await DashboardRoleMapping.find({ where: { dashboardId: this.id }, include: "collaborator" })
        const users = permissions.map(permission => {
          const { editor, viewer, id, sent } = permission
          if (!permission.collaborator()) {
            const { email } = permission
            return { permissions: { editor, viewer }, email, id, sent }
          }
          const { firstName, lastName, email } = permission.collaborator()
          return { permissions: { editor, viewer }, firstName, lastName, email, id, sent }
        })
        resolve(users)
      } catch (e) {
        reject(e)
      }
    })
  }
};
