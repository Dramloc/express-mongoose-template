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
      .limit(parseInt(limit, 0))
      .skip(parseInt(skip, 0))
      .sort(sort)
      .select(select)
      .populate(populate);
    const countQuery = Model.find(listQuery.getQuery()).countDocuments();
    const [totalCount, list] = await Promise.all([countQuery, listQuery]);
    res.set("X-Total-Count", totalCount);
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
  const entity = await Model.findById(id)
    .select(select)
    .populate(populate);
  if (!entity) {
    return next(Boom.notFound(`${Model.modelName} "${id}" not found.`));
  }
  res.locals.entity = entity;
  return next();
};

export const findById = (req, res) => res.json(res.locals.entity);

const pick = allowedKeys => object => {
  const entries = Object.entries(object);
  const filteredEntries = entries.filter(([key]) => allowedKeys.includes(key));
  return Object.fromEntries(filteredEntries);
};

export const bind = Model => {
  const allowedKeys = Object.keys(Model.schema.obj);
  const sanitize = pick(allowedKeys);
  return async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    if (!res.locals.entity) {
      // Entity is not loaded, create a new instance
      res.locals.entity = new Model(sanitizedBody);
      return next();
    }
    // Update loaded entity with request body
    // FIXME: this is valid for `PATCH` operations but we probably want to iterate over `allowedKeys` for `PUT` operations
    res.locals.entity.set(sanitizedBody);
    return next();
  };
};

export const validate = async (req, res, next) => {
  const { entity } = res.locals;
  try {
    await entity.validate();
    return next();
  } catch (error) {
    return next(Boom.badData(error.message));
  }
};

export const save = async (req, res, next) => {
  const { entity } = res.locals;
  const { isNew } = entity;
  try {
    await entity.save();
    return isNew ? res.status(201).json(entity) : res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  const { entity } = res.locals;
  try {
    await entity.remove();
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
