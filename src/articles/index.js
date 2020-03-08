import express from "express";
import * as crud from "../utils/crud.js";
import * as rest from "../utils/rest.js";
import { Article } from "./Article.js";

const router = express.Router();

router
  .route("/")
  .get(rest.find({ find: req => crud.find(Article, req.query) }))
  .post(
    rest.bind({ bind: (document, req) => crud.create(Article, req.body) }),
    rest.validate({ validate: crud.validate }),
    rest.save({ save: crud.save, isNew: true })
  );

router.param("id", rest.validateParam({ validate: crud.isIdValid })).param(
  "id",
  rest.load({
    load: (id, req) => crud.findById(Article, id, req.query),
    modelName: Article.modelName
  })
);

router
  .route("/:id")
  .get(rest.findById)
  .put(
    rest.bind({
      bind: (document, req) => crud.update(document, req.body)
    }),
    rest.validate({ validate: crud.validate }),
    rest.save({ save: crud.save, isNew: false })
  )
  .patch(
    rest.bind({
      bind: (document, req) => crud.patch(document, req.body)
    }),
    rest.validate({ validate: crud.validate }),
    rest.save({ save: crud.save, isNew: false })
  )
  .delete(rest.remove({ remove: crud.remove }));

export default router;
