import { CREATED, NO_CONTENT, NOT_FOUND } from 'http-status';
import { Router } from 'express';

import { findById, create, update, remove, exists, find } from './grid-fs';

const router = new Router();

router
  .route('/')
  .get(async (req, res, next) => {
    try {
      const images = await find();
      return res.json(images);
    } catch (error) {
      return next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const file = await create(req);
      return res.status(CREATED).json(file);
    } catch (error) {
      return next(error);
    }
  });
router
  .route('/:id')
  .get(async (req, res, next) => {
    try {
      const image = await findById(req.params.id);
      return res.end(image);
    } catch (error) {
      return next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      await update(req, req.params.id);
      return res.sendStatus(NO_CONTENT);
    } catch (error) {
      return next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      await remove(req.params.id);
      return res.sendStatus(NO_CONTENT);
    } catch (error) {
      return next(error);
    }
  });

router.param('id', async (req, res, next, id) => {
  try {
    const found = await exists(id);
    if (!found) {
      return next({ status: NOT_FOUND, message: `Image "${id}" not found` });
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

export default router;
