/**
 * Returns a request handler that will catch any errors (synchronous or asynchronous) that could be thrown by the given `handler`.
 * @type {<P = import('express-serve-static-core').ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = import('express-serve-static-core').Query> (handler: import('express').RequestHandler<P, ResBody, ReqBody, ReqQuery>) => import('express').RequestHandler<P, ResBody, ReqBody, ReqQuery>}
 */
export const forwardErrors = (handler) => async (req, res, next, ...args) => {
  try {
    return await handler(req, res, next, ...args);
  } catch (err) {
    return next(err);
  }
};
