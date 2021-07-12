import HttpError from '@wasp/core/HttpError.js'

export const createList = async ({ name }, context) => {
  if (!context.user) { throw new HttpError(403) }
  return context.entities.List.create({
    data: {
      name,
      user: { connect: { id: context.user.id } }
    }
  })
}
