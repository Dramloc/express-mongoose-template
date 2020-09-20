/**
 * Removes mongoose custom properties from the given object.
 * @type {<T extends Object>(body: T) => Omit<T, ('createdAt' | 'updatedAt' | '__v')>}
 */
export const sanitize = ({ createdAt, updatedAt, __v, ...rest }) => {
  return rest;
};
