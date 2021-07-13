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

export const updateList = async ({ listId, data }, context) => {
  if (!context.user) { throw new HttpError(403) }
  return context.entities.List.updateMany({
    where: { id: listId, user: { id: context.user.id } },
    data: {
      name: data.name
    }
  })
}
