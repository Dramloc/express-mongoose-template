import Boom from "@hapi/boom";

/**
 * Execute `handler` to retrieve a list of document and the total count of documents in this collection.
 * It will then add the resulting collection document to the response header (`X-Total-Count` by default),
 * and set the resulting list as the response body.
 * @param {Object} options
 * @param {(req: import("express").Request) => [T[], number] | Promise<[T[], number]>} options.handler The handler that finds a list of document and the document count in the collection
 * @param {string} [options.totalCountHeader="X-Total-Count"] The header name to used for the total document count
 * @returns {import("express").RequestHandler}
 * @template T
 * @example
 * ```js
 * router.route('/').get(find({ handler: (req) => findAllArticles(req.query) }))
 * ```
 * @example
 * ```js
 * router.route('/').get(find({ handler: (req) => findAllArticles(req.query), totalCountHeader: "Pagination-Count" }))
 * ```
 */
export const find = ({ handler, totalCountHeader = "X-Total-Count" }) => async (
  req,
  res,
  next
) => {
  try {
    const [list, totalCount] = await handler(req);
    res.set(totalCountHeader, String(totalCount));
    return res.json(list);
  } catch (error) {
    return next(error);
  }
};

/**
 * Validate an express parameter with the given handler.
 * If handler does not validate the parameter value, will return a 400.
 * @param {Object} options
 * @param {(value: string, req: import("express").Request) => boolean | Promise<boolean>} options.handler - The parameter validator
 * @returns {import("express").RequestParamHandler}
 * @example
 * ```js
 * router.param('id', validateParam({ handler: (value) => isParamaterValid(value) }))
 * ```
 */
export const validateParam = ({ handler }) => async (
  req,
  res,
  next,
  value,
  name
) => {
  try {
    const isValid = await handler(value, req);
    if (isValid) {
      return next();
    }
    return next(
      Boom.badRequest(`Invalid parameter "${name}" with value "${value}".`)
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Load a document in the express locals using the given handler.
 * If the document cannot be found, returns a 404.
 * The 404 message can be changed by changing the `modelName` parameter.
 * The locals where the document is stored can be changed by specifying the `documentKey` parameter (`document` is used by default).
 * @param {Object} options
 * @param {(value: string, req: import("express").Request) => T | Promise<T>} options.handler The handler that loads the document given the param value
 * @param {string} [options.modelName="Document"] The document model name (used for error message)
 * @param {string} [options.documentKey="document"] The express local key where the document will be stored
 * @returns {import("express").RequestParamHandler}
 * @template T
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value) }));
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), documentKey: "article" }));
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), modelName: "Article" }));
 * ```
 */
export const load = ({
  handler,
  modelName = "Document",
  documentKey = "document"
}) => async (req, res, next, value, name) => {
  try {
    const document = await handler(value, req);
    if (!document) {
      return next(
        Boom.notFound(`${modelName} with ${name} "${value}" not found.`)
      );
    }
    res.locals[documentKey] = document;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Outputs the express locals with given key.
 * @param {Object} options
 * @param {string} [options.documentKey="document"] The express local key where the document is stored
 * @returns {import("express").RequestHandler}
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value) }));
 * router.router('/:id').get(findById());
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), documentKey: 'article' }));
 * router.router('/:id').get(findById({ documentKey: 'article' }));
 * ```
 */
export const findById = ({ documentKey = "document" } = {}) => (req, res) =>
  res.json(res.locals[documentKey]);

/**
 * Assigns a new value to the document stored in the express locals after being processed by the given handler.
 * @param {Object} options
 * @param {(document: T, req: import("express").Request) => T | Promise<T>} options.handler The handler that bind the current document with the changes received in the request
 * @param {string} [options.documentKey="document"] The express local key where the document is stored
 * @returns {import("express").RequestHandler}
 * @template T
 * @example
 * ```js
 * router.route('/').post(bind({ handler: (_, req) => new Article(req.body) }));
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value) }));
 * router.route('/:id').put(bind({ handler: (document, req) => updateArticle(document, req.body) }));
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), documentKey: 'article' }));
 * router.route('/:id').put(bind({ handler: (document, req) => updateArticle(document, req.body), documentKey: 'article' }));
 * ```
 */
export const bind = ({ handler, documentKey = "document" }) => async (
  req,
  res,
  next
) => {
  try {
    res.locals[documentKey] = await handler(res.locals[documentKey], req);
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Validates the document stored in the express locals with the given handler.
 * The handler should throw if the document is not valid.
 * If the document is not valid, a 422 will be forwarded to error middlewares.
 * @param {Object} options
 * @param {(document: T) => any} options.handler The document validator handler. Should throw if the document is not valid.
 * @param {string} [options.documentKey="document"] The express local key where the document is stored
 * @returns {import("express").RequestHandler}
 * @template T
 * @example
 * ```js
 * router.route('/').post(
 *   bind({ handler: (_, req) => new Article(req.body) }),
 *   validate({ handler: (document) => validateArticle(document) })
 * );
 * ```
 * @example
 * ```js
 * router.route('/').post(
 *   bind({ handler: (_, req) => new Article(req.body), documentKey: 'article' }),
 *   validate({ handler: (document) => validateArticle(document), documentKey: 'article' })
 * );
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value) }));
 * router.route('/:id').put(
 *   bind({ handler: (document, req) => updateArticle(document, req.body) }),
 *   validate({ handler: (document) => validateArticle(document) })
 * );
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), documentKey: 'article' }));
 * router.route('/:id').put(
 *   bind({ handler: (document, req) => updateArticle(document, req.body), documentKey: 'article' }),
 *   validate({ handler: (document) => validateArticle(document), documentKey: 'article' })
 * );
 * ```
 */
export const validate = ({ handler, documentKey = "document" }) => async (
  req,
  res,
  next
) => {
  try {
    await handler(res.locals[documentKey]);
    return next();
  } catch (error) {
    return next(Boom.badData(error.message, error));
  }
};

/**
 * Saves the document stored in the express locals with the given handler.
 * If `isNew` is specified, will return a 201 with the created document in the body.
 * Otherwise, will return a 204.
 * @param {Object} options
 * @param {(document: T) => Promise<T>} options.handler The handler that saves the document
 * @param {boolean} options.isNew Flag that determines the response (201 with created document or 204)
 * @param {string} [options.documentKey="document"] The express local key where the document is stored
 * @returns {import("express").RequestHandler}
 * @template T
 * @example
 * ```js
 * router.route('/').post(
 *   bind({ handler: (_, req) => new Article(req.body) }),
 *   validate({ handler: (document) => validateArticle(document) }),
 *   save({ handler: (document) => saveArticle(document), isNew: true })
 * );
 * ```
 * @example
 * ```js
 * router.route('/').post(
 *   bind({ handler: (_, req) => new Article(req.body), documentKey: 'article' }),
 *   validate({ handler: (document) => validateArticle(document), documentKey: 'article' }),
 *   save({ handler: (document) => saveArticle(document), isNew: true, documentKey: 'article' })
 * );
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value) }));
 * router.route('/:id').put(
 *   bind({ handler: (document, req) => updateArticle(document, req.body) }),
 *   validate({ handler: (document) => validateArticle(document) }),
 *   save({ handler: (document) => saveArticle(document), isNew: false })
 * );
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), documentKey: 'article' }));
 * router.route('/:id').put(
 *   bind({ handler: (document, req) => updateArticle(document, req.body), documentKey: 'article' }),
 *   validate({ handler: (document) => validateArticle(document), documentKey: 'article' }),
 *   save({ handler: (document) => saveArticle(document), isNew: false, documentKey: 'article' })
 * );
 * ```
 */
export const save = ({ handler, isNew, documentKey = "document" }) => async (
  req,
  res,
  next
) => {
  try {
    const savedDocument = await handler(res.locals[documentKey]);
    return isNew ? res.status(201).json(savedDocument) : res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

/**
 * Saves the document stored in the express locals with the given handler.
 * Will return a 204.
 * @param {Object} options
 * @param {(document: T) => any} options.handler The handler that removes the document.
 * @param {string} [options.documentKey="document"] The express local key where the document is stored
 * @returns {import("express").RequestHandler}
 * @template T
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value) }));
 * router.route('/:id').delete(
 *   remove({ handler: (document) => removeArticle(document) })
 * );
 * ```
 * @example
 * ```js
 * router.param('id', load({ handler: (value) => findArticleById(value), documentKey: 'article' }));
 * router.route('/:id').delete(
 *   remove({ handler: (document) => removeArticle(document), documentKey: 'article' })
 * );
 * ```
 */
export const remove = ({ handler, documentKey = "document" }) => async (
  req,
  res,
  next
) => {
  try {
    await handler(res.locals[documentKey]);
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
