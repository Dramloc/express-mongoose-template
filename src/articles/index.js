import express from "express";
import {
  bind,
  find,
  findById,
  loadId,
  remove,
  save,
  validate,
  validateId
} from "../utils/rest.js";
import { Article } from "./Article.js";

const router = express.Router();

router
  .route("/")
  .get(find(Article))
  .post(bind(Article), validate, save);

router.param("id", validateId).param("id", loadId(Article));

router
  .route("/:id")
  .get(findById)
  .put(bind(Article, { overwrite: true }), validate, save)
  .patch(bind(Article), validate, save)
  .delete(remove);

export default router;
