import Boom from "@hapi/boom";
import express from "express";
import { forwardErrors } from "../utils/forwardErrors";
import { sanitize } from "../utils/sanitize";
import { validateObjectId } from "../utils/validateObjectId";
import { Article } from "./Article";

const router = express.Router();

router
  .route("/")
  .get(
    forwardErrors(async (req, res) => {
      const { limit = 20, skip = 0, sort = "_id", select, populate = "", ...filter } = req.query;
      const listQuery = Article.find(filter)
        .limit(Number(limit))
        .skip(Number(skip))
        .sort(sort)
        .select(select)
        .populate(populate);
      const totalCountQuery = Article.find(listQuery.getFilter()).countDocuments();
      const [list, totalCount] = await Promise.all([listQuery, totalCountQuery]);
      res.set("X-Total-Count", String(totalCount));
      return res.json(list);
    })
  )
  .post(
    forwardErrors(async (req, res) => {
      const article = await Article.create(sanitize(req.body));
      return res.status(201).json(article);
    })
  );

router
  .param("id", validateObjectId)
  .param(
    "id",
    forwardErrors(async (req, res, next, value) => {
      const { select, populate = "" } = req.query;
      const article = await Article.findById(value).select(select).populate(populate);
      res.locals.article = article;
      return next();
    })
  )
  .param("id", (req, res, next, value, name) => {
    const { article } = res.locals;
    return article !== null
      ? next()
      : next(
          Boom.notFound(`${Article.modelName} with \`${name}\` matching \`${value}\` not found.`)
        );
  });

router
  .route("/:id")
  .get((req, res) => {
    const { article } = res.locals;
    return res.json(article);
  })
  .patch(
    forwardErrors(async (req, res) => {
      const { article } = res.locals;
      article.set(sanitize(req.body));
      await article.save();
      return res.sendStatus(204);
    })
  )
  .delete(
    forwardErrors(async (req, res) => {
      const { article } = res.locals;
      await article.remove();
      return res.sendStatus(204);
    })
  );

export default router;
