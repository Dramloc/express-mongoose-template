import { Router } from 'express';
import status from 'http-status';

import createLogger from '../logger';
import validateId from '../middleware/validate-id';

import Article from './article.model';

const router = new Router();
const logger = createLogger('articles');

// FIXME: add rate limit

router
  .route('/')
  .get(async (req, res, next) => {
    try {
      // FIXME: add clean pagination, sorting, fields inclusion/exclusion
      // Pagination: ?limit & ?offset parameters, Link rel header, X-Total-Count header
      // Sorting: ?sort=foo,-bar
      // Fields: ?fields=foo,bar.baz,-quux
      // Search: ?foo.bar=Fooo
      return res.json(await Article.find());
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  })
  .post(async (req, res, next) => {
    const { title, description, reference } = req.body;
    const article = new Article({
      title,
      description,
      reference,
    });
    try {
      // FIXME: validate parameters with express-validator?
      await article.validate();
    } catch (error) {
      // FIXME: validation error format
      logger.error(error);
      return next({
        status: status.UNPROCESSABLE_ENTITY,
        message: error.message,
        errors: error.errors,
      });
    }
    try {
      await article.save();
      return res
        .location(`${req.baseUrl}/${article._id}`)
        .status(status.CREATED)
        .json(article);
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  });

router
  .route('/:id')
  .get(async (req, res, next) => {
    const { article } = req.params;
    try {
      return res.json(article);
    } catch (error) {
      return next(error);
    }
  })
  .put(async (req, res, next) => {
    const { article } = req.params;
    // FIXME: only get exposed properties
    article.set(req.body);
    try {
      // FIXME: validate parameters with express-validator?
      await article.validate();
    } catch (error) {
      // FIXME: validation error format
      return next({ status: status.UNPROCESSABLE_ENTITY, message: error.message });
    }
    try {
      await article.save();
      return res.json(article);
    } catch (error) {
      return next(error);
    }
  })
  .delete(async (req, res, next) => {
    const { article } = req.params;
    try {
      // FIXME: resource doesn't need to be fetched, id is enough
      await article.remove();
      return res.sendStatus(status.NO_CONTENT);
    } catch (error) {
      return next(error);
    }
  });

router.param('id', validateId()).param('id', async (req, res, next, id) => {
  try {
    const article = await Article.findById(id);
    if (!article) {
      return next({ status: status.NOT_FOUND, message: `Article "${id}" not found` });
    }
    req.params.article = article;
    return next();
  } catch (error) {
    return next(error);
  }
});

export default router;
