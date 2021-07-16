import HttpError from '@wasp/core/HttpError.js'

/* List */

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

export const deleteList = async ({ listId }, context) => {
  if (!context.user) { throw new HttpError(403) }

  // TODO(matija): ensure that user is not trying to delete somebody else's list.
  await context.entities.List.delete({
    where: { id: listId }
  })
}

/* Card */

export const createCard = async ({ title, listId }, context) => {
  if (!context.user) { throw new HttpError(403) }
  return context.entities.Card.create({
    data: {
      title,
      list: { connect: { id: listId } },
      author: { connect: { id: context.user.id } }
    }
  })
}

