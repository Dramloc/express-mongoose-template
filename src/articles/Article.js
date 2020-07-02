import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const ArticleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    body: { type: String },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

ArticleSchema.plugin(uniqueValidator);

export const Article = mongoose.model("Article", ArticleSchema);
