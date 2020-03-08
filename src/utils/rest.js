import Boom from "@hapi/boom";

/** @type {<T> (options: { find: (req: import("express").Request) => [T[], number] | Promise<[T[], number]> }) => import("express").RequestHandler} */
export const find = ({ find }) => async (req, res, next) => {
  try {
    const [list, totalCount] = await find(req);
    res.set("X-Total-Count", String(totalCount));
    return res.json(list);
  } catch (error) {
    return next(error);
  }
};

/** @type {(options: { validate: (value: string, req: import("express").Request) => boolean | Promise<boolean> }) => import("express").RequestParamHandler} */
export const validateParam = ({ validate }) => async (
  req,
  res,
  next,
  value,
  name
) => {
  try {
    const isValid = await validate(value, req);
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

/** @type {<T> (options: { load: (value: string, req: import("express").Request) => Promise<T>, modelName?: string }) => import("express").RequestParamHandler} */
export const load = ({ load, modelName = "Document" }) => async (
  req,
  res,
  next,
  value,
  name
) => {
  try {
    const document = await load(value, req);
    if (!document) {
      return next(
        Boom.notFound(`${modelName} with ${name} "${value}" not found.`)
      );
    }
    res.locals.document = document;
    return next();
  } catch (error) {
    return next(error);
  }
};

/** @type {import("express").RequestHandler} */
export const findById = (req, res) => res.json(res.locals.document);

/** @type {<T> (options: { bind: (document: T, req: import("express").Request) => T | Promise<T> }) => import("express").RequestHandler} */
export const bind = ({ bind }) => async (req, res, next) => {
  try {
    res.locals.document = await bind(res.locals.document, req);
    return next();
  } catch (error) {
    return next(error);
  }
};

/** @type {<T> (options: { validate: (document: T) => void | Promise<void> }) => import("express").RequestHandler} */
export const validate = ({ validate }) => async (req, res, next) => {
  try {
    await validate(res.locals.document);
    return next();
  } catch (error) {
    return next(Boom.badData(error.message));
  }
};

/** @type {<T> (options: { save: (document: T) => Promise<T>, isNew: boolean }) => import("express").RequestHandler} */
export const save = ({ save, isNew }) => async (req, res, next) => {
  try {
    const savedDocument = await save(res.locals.document);
    return isNew ? res.status(201).json(savedDocument) : res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

/** @type {<T> (options: { remove: (document: T) => any }) => import("express").RequestHandler} */
export const remove = ({ remove }) => async (req, res, next) => {
  try {
    await remove(res.locals.document);
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
