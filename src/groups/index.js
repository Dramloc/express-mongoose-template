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
import { Group } from "./Group.js";

const router = new express.Router();

router
  .route("/")
  .get(find(Group))
  .post(bind(Group), validate, save);

router.param("id", validateId).param("id", loadId(Group));

router
  .route("/:id")
  .get(findById)
  .put(bind(Group), validate, save)
  .delete(remove);

export default router;
