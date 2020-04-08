'use strict';

module.exports = function (User) {

  User.afterRemote('create', (context, user, next) => new Promise(async (resolve, reject) => {
    const { Role, RoleMapping, DashboardRoleMapping } = User.app.models
    const roleString = user.roleString || 'personal'
    const { email } = user
    try {
      const role = await Role.findOne({ where: { name: roleString } })
      await role.principals.create({ principalType: RoleMapping.USER, principalId: user.id })

      const collaborationInvitations = await DashboardRoleMapping.find({ email })

      if (collaborationInvitations && collaborationInvitations.length) {
        await Promise.all(collaborationInvitations.map(async invitation => {
          const organization = await invitation.organization.get()
          const dashboard = await invitation.dashboard.get()
          const { editor } = invitation
          const type = editor ? `edit` : 'view'

          return Promise.all([
            invitation.updateAttributes({ collaboratorId: user.id, sent: true }),
            user.notifications.create({
              seen: false,
              message: `${organization.id} added you to ${type} ${dashboard.title} dashboard.`,
              userId: user.id,
              type: "Dashboard Collaboration"
            })
          ])
        }))
      }

      resolve()
    } catch (e) {
      console.log(e)
      reject(e)
    }
  }))
}
