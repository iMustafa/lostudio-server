'use strict';

module.exports = function (Invitation) {

  Invitation.beforeRemote('create', (ctx, _, __) => new Promise(async (resolve, reject) => {
    const { organizationId, collaboratorId, bypass } = ctx.args.data
    const { user } = Invitation.app.models
    const { userId } = ctx.args.options.accessToken

    if (organizationId != userId) {
      const error = new Error('Authorization Required');
      error.status = 401;
      error.name = 'Error';
      error.code = 'AUTHORIZATION_REQUIRED';
      reject(error)
    }

    if (bypass) return resolve()

    const oldInvitation = await Invitation.findOne({ organizationId, collaboratorId })
    if (!oldInvitation) return resolve()

    const { status } = oldInvitation
    const collaborator = await user.findById(collaboratorId)

    switch (status) {
      case 'pending':
        return reject({ message: `You've already sent ${collaborator.firstName} a collaboration invitation. Please wait for him  to either accept or decline it before sending a new one.` })
      case 'declined':
        return reject({ message: `${collaborator.firstName} has rejected a previous invitation from you before. Are you  sure you want to send them a new one?` })
      default:
        return resolve()
    }

  }))

  Invitation.remoteMethod('accept', {
    description: 'Accept Invitation',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/accept' }
  })
  Invitation.prototype.accept = function (options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { OrganizationCollaborators } = Invitation.app.models
        const { organizationId, collaboratorId, type } = this
        await this.updateAttributes({ status: 'accepted' })
        const collaboration = await OrganizationCollaborators.create({ organizationId, collaboratorId })
        resolve(collaboration)
      } catch (e) {
        reject(e)
      }
    })
  }

  Invitation.remoteMethod('decline', {
    description: 'Decline Invitation',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/decline' }
  })
  Invitation.prototype.decline = function (options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { organizationId, collaboratorId } = this
        await this.updateAttributes({ status: 'declined' })
        resolve({ organizationId, collaboratorId, status: 'declined' })
      } catch (e) {
        reject(e)
      }
    })
  }

  Invitation.remoteMethod('initialize', {
    description: 'Initialize Invitation',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/initialize' }
  })
  Invitation.prototype.initialize = function (options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { organizationId, collaboratorId, email } = this
        const { user } = Invitation.app.models
        if (collaboratorId) reject(new Error("Invitation is already initialized"))

        const collaborator = await user.findOne({ email })
        this.updateAttributes({ collaboratorId: collaborator.id })
        resolve({ organizationId, collaboratorId: collaborator.id, status: "pending" })
      } catch (e) {
        reject(e)
      }
    })
  }

};
