import Boom from "@hapi/boom";
import mongoose from "mongoose";

export const find = Model => async (req, res, next) => {
  try {
    const {
      limit = 20,
      skip = 0,
      sort,
      select,
      populate = "",
      ...query
    } = req.query;
    const listQuery = Model.find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort(sort)
      .select(select)
      .populate(populate);
    const countQuery = Model.find(listQuery.getQuery()).countDocuments();
    const [list, totalCount] = await Promise.all([listQuery, countQuery]);
    res.set("X-Total-Count", String(totalCount));
    return res.json(list);
  } catch (error) {
    return next(error);
  }
};

export const validateId = (req, res, next, id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return next();
  }
  return next(Boom.badRequest(`Invalid id "${id}".`));
};

export const loadId = Model => async (req, res, next, id) => {
  const { select, populate = "" } = req.query;
  const document = await Model.findById(id)
    .select(select)
    .populate(populate);
  if (!document) {
    return next(Boom.notFound(`${Model.modelName} "${id}" not found.`));
  }
  res.locals.document = document;
  return next();
};

export const findById = (req, res) => res.json(res.locals.document);

const pick = allowedKeys => object => {
  const entries = Object.entries(object);
  const filteredEntries = entries.filter(([key]) => allowedKeys.includes(key));
  return Object.fromEntries(filteredEntries);
};

export const bind = (Model, { overwrite = false } = {}) => {
  const allowedKeys = Object.keys(Model.schema.obj);
  const sanitize = pick(allowedKeys);
  return async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    if (!res.locals.document) {
      // Document is not loaded, create a new instance
      res.locals.document = new Model(sanitizedBody);
      return next();
    }
    // Update loaded document with request body
    if (overwrite) {
      // FIXME: `overwrite` resets `createdAt`
      res.locals.document.overwrite(sanitizedBody);
    } else {
      res.locals.document.set(sanitizedBody);
    }
    return next();
  };
};

export const validate = async (req, res, next) => {
  const { document } = res.locals;
  try {
    await document.validate();
    return next();
  } catch (error) {
    return next(Boom.badData(error.message));
  }
};

export const save = async (req, res, next) => {
  const { document } = res.locals;
  const { isNew } = document;
  try {
    await document.save();
    return isNew ? res.status(201).json(document) : res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  const { document } = res.locals;
  try {
    await document.remove();
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
