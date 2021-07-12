import HttpError from '@wasp/core/HttpError.js'

export const getLists = async (args, context) => {
  if (!context.user) { throw new HttpError(403) }
  return context.entities.List.findMany(
    { where: { user: { id: context.user.id } } }
  )
}
