export const forwardErrors = (handler) => async (req, res, next, ...args) => {
  try {
    return await handler(req, res, next, ...args);
  } catch (err) {
    return next(err);
  }
};
