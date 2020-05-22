import mongoose from "mongoose";

/**
 * @typedef PaginationParams
 * @property {number|string} [limit=20] A page size to limit result count (e.g.: `20` if you want a maximum of 20 results per page).
 * Pass `0` if you want to retrieve all results.
 * ```js
 * // Retrieve all results
 * const all = await find(Article, { limit: 0 });
 * // Retrieve the first 10 results
 * const page = await find(Article, { limit: 10 });
 * ```
 * @property {number|string} [skip=0] A pagination offset to skip some results (e.g.: `10` if you want to skip the 10 first results).
 * ```js
 * // Retrieve the first page
 * const firstPage = await find(Article, { limit: 20, skip: 0 });
 * // Retrieve the second page
 * const secondPage = await find(Article, { limit: 20, skip: 20 });
 * ```
 */

/** @typedef {1 | 'asc' | 'ascending' | -1 | 'desc' | 'descending'} SortDirection */
/**
 * @typedef SortParams
 * @property {string | {[key: string]: SortDirection} | [string, SortDirection][]} [sort=_id] A sort expression to sort results. See https://github.com/aheckmann/mquery#sort for more details.
 * ```js
 * // Retrieve the results sorted by slug in ascending order
 * const resultsSortedBySlugAsc = await find(Article, { sort: "slug" });
 * // The following syntaxes can also be used:
 * await find(Article, { sort: { slug: 1 } });
 * await find(Article, { sort: { slug: 'asc' } });
 * await find(Article, { sort: { slug: 'ascending' } });
 * await find(Article, { sort: [['slug', 1]] });
 * await find(Article, { sort: [['slug', 'asc']] });
 * await find(Article, { sort: [['slug', 'ascending']] });
 *
 * // Retrieve the results sorted by slug in descending order
 * const resultsSortedBySlugDesc = await find(Article, { sort: "-slug" });
 * // The following syntax can also be used:
 * await find(Article, { sort: { slug: -1 } });
 * await find(Article, { sort: { slug: 'desc' } });
 * await find(Article, { sort: { slug: 'descending' } });
 * await find(Article, { sort: [['slug', -1]] });
 * await find(Article, { sort: [['slug', 'desc']] });
 * await find(Article, { sort: [['slug', 'descending']] });
 *
 * // Retrieve the results sorted on multiple columns
 * const resultsSortedBySlugAscAndTitleDesc = await find(Article, { sort: "slug -title" });
 * // The following syntax can also be used:
 * await find(Article, { sort: { slug: 1, title: -1 } });
 * await find(Article, { sort: { slug: 'asc', title: 'desc } });
 * await find(Article, { sort: { slug: 'asc', title: 'descending' } });
 * await find(Article, { sort: [['slug', 1], ['title', -1]] });
 * await find(Article, { sort: [['slug', 'asc'], ['title', 'desc']] });
 * await find(Article, { sort: [['slug', 'ascending'], ['title', 'descending']] });
 * ```
 */

// TODO: document the populate params, this might require to create another model and add it to Article (e.g.: Comments, User, etc.)
/**
 * @typedef PopulateParams
 * @property {string | string[] | mongoose.QueryPopulateOptions | mongoose.QueryPopulateOptions} [populate]
 * @see https://mongoosejs.com/docs/api.html#query_Query-populate
 */

/**
 * @typedef SelectParams
 * @property {string | string[] | {[key: string]: -1 | 1}} [select] A select expression. See https://mongoosejs.com/docs/api.html#query_Query-select for more information.
 * The document `_id` will always be retrieved.
 * ```js
 * // Only retrieve the document slug field
 * const resultsWithSlug = await find(Article, { select: "slug" });
 * // The following syntax can also be used:
 * await find(Article, { select: { slug: 1 } });
 *
 * // Retrieve all document fields without the slug field
 * const resultsWithoutSlug = await find(Article, { select: "-slug" });
 * // The following syntax can also be used:
 * await find(Article, { select: { slug: -1 } });
 *
 * // Retrieve multiple fields
 * const resultsSortedBySlugAscAndTitleDesc = await find(Article, { select: "slug title" });
 * // The following syntax can also be used:
 * await find(Article, { select: { slug: 1, title: 1 } });
 * ```
 */

// TODO: document and type query language
/**
 * Find documents for the given model.
 * To allow pagination, this will also retrieve the count of all documents for the given params.
 * @param {mongoose.Model<T, {}>} Model A mongoose model
 * @param {PaginationParams & SortParams & PopulateParams & SelectParams} [params] The query parameters if you want to control the pagination, result format or filter results
 * @returns {Promise<[T[], number]>} A promise resolving with an array containing the array of results and the count of documents.
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const [page, totalCount] = await find(Article);
 * ```
 * @example
 * ```js
 * const [page, totalCount] = await find(Article, { limit: 10, skip: 10 });
 * ```
 * @example
 * ```js
 * const [page, totalCount] = await find(Article, { sort: "slug -title" });
 * ```
 * @example
 * ```js
 * const [page, totalCount] = await find(Article, { select: "slug" });
 * ```
 * @example
 * ```js
 * const [page, totalCount] = await find(Article, { title: "My Article" });
 * ```
 * @example
 * ```js
 * const [page, totalCount] = await find(Article, { title: { $regex: "My .* Article" });
 * ```
 */
export const find = (
  Model,
  { limit = 20, skip = 0, sort = "_id", select, populate = "", ...query } = {}
) => {
  // FIXME: populate could be abused?
  const listQuery = Model.find(query)
    // TODO: validate limit parameter
    .limit(Number(limit))
    // TODO: validate skip parameter
    .skip(Number(skip))
    // TODO: validate sort parameter
    .sort(sort)
    // TODO: validate select parameter
    .select(select)
    // TODO: validate populate parameter
    .populate(populate);
  const totalCountQuery = Model.find(listQuery.getQuery()).countDocuments();
  return Promise.all([listQuery, totalCountQuery]);
};

/**
 * Finds a single document by its `_id` field.
 * @param {mongoose.Model<T, {}>} Model A mongoose model
 * @param {string} id The document id
 * @param {PopulateParams & SelectParams} [params] The select and populate parameters if you want to control the result format
 * @returns {Promise<T | null>} A promise resolving with the queried document or `null` if it cannot be found
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const document = await findById(Article, id);
 * ```
 * @example
 * ```js
 * const document = await findById(Article, id, { select: 'slug' });
 * ```
 */
export const findById = async (Model, id, { select, populate = "" } = {}) => {
  // FIXME: populate could be abused?
  return (
    Model.findById(id)
      // TODO: validate select parameter
      .select(select)
      // TODO: validate populate parameter
      .populate(populate)
  );
};

/**
 * Executes registered validation rules for the given document.
 * Will reject with a `mongoose.Error.ValidationError` if the document doesn't pass validation.
 * @param {T} document A mongoose document
 * @returns {Promise<void>} A promise resolving when the document is validated
 * @template {mongoose.Document} T
 * @example
 * ```js
 * try {
 *   const document = create(Article, { slug: "my-article", title: "My Article" });
 *   await validate(document);
 * } catch (error) {
 *   // Handle validation error
 * }
 * ```
 */
export const validate = (document) => document.validate();

const pick = (allowedKeys, object) => {
  const entries = Object.entries(object);
  const filteredEntries = entries.filter(([key]) => allowedKeys.includes(key));
  return Object.fromEntries(filteredEntries);
};

const sanitize = (schema, body) => {
  const allowedKeys = Object.keys(schema.obj);
  return pick(allowedKeys, body);
};

/**
 * Create a new document instance for the given model. The document is not persisted until `document.save` (or this module `save` function) is called.
 * The given payload is sanitized to avoid overwritting properties that are not part of the user-defined schema (e.g.: mongoose `__v`, `createdAt` or `updatedAt` fields).
 * @param {mongoose.Model<T, {}>} Model A mongoose model
 * @param {any} payload Values with which to create the document
 * @returns {T} The created document
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const document = create(Article, { slug: "my-article", title: "My Article" });
 * ```
 */
export const create = (Model, payload) => new Model(sanitize(Model.schema, payload));

/**
 * Update a document with the given payload. All values are overwritten, except for immutable properties.
 * If you want to keep the previous document values and only update the document properties present in the payload, you can use the `patch` function.
 * The changes are not persisted until `document.save` (or this module `save` function) is called.
 * The given payload is sanitized to avoid overwritting properties that are not part of the user-defined schema (e.g.: mongoose `__v`, `createdAt` or `updatedAt` fields).
 * @param {T} document The document to update
 * @param {any} payload The object to overwrite this document with
 * @returns {T} The updated document
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const document = await findById(Article, id);
 * const updatedDocument = update(document, { slug: "my-new-article", title: "My New Article" })
 * ```
 */
export const update = (document, payload) => {
  // FIXME: `createdAt` is reset
  return document.overwrite(sanitize(document.schema, payload));
};

/**
 * Update a document with the given payload. Only the specified values are updated.
 * If you want to overwrite all of the document properties, you can use the `update` function.
 * The changes are not persisted until `document.save` (or this module `save` function) is called.
 * The given payload is sanitized to avoid overwritting properties that are not part of the user-defined schema (e.g.: mongoose `__v`, `createdAt` or `updatedAt` fields).
 * @param {T} document The document to update
 * @param {any} payload The object to update this document with
 * @returns {T} The updated document
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const document = await findById(Article, id);
 * const patchedDocument = patch(document, { slug: "my-new-article" })
 * ```
 */
export const patch = (document, payload) => document.set(sanitize(document.schema, payload));

/**
 * Saves the given document.
 * @param {T} document A mongoose document
 * @returns {Promise<T>} A promise resolving with the saved document
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const document = create(Article, { slug: "my-article", title: "My Article" });
 * await save(document);
 * ```
 * @example
 * ```js
 * const document = await findById(Article, id);
 * const updatedDocument = update(document, { slug: "my-new-article", title: "My New Article" })
 * await save(document);
 * ```
 */
export const save = (document) => document.save();

/**
 * Removes the given document.
 * @param {T} document A mongoose document
 * @returns {Promise<T>} A promise resolving with the removed document
 * @template {mongoose.Document} T
 * @example
 * ```js
 * const document = await findById(Article, id);
 * await remove(document);
 * ```
 */
export const remove = (document) => document.remove();

/**
 * Check if the given id a valid document object id
 * @param {string} id The id to validate
 * @returns {boolean} true if the id is a valid document object id, false otherwise
 * @example
 * ```js
 * isIdValid("1") === false
 * isIdValid("5e64c1d0c39f823bf8c8af93") === true
 * ```
 */
export const isIdValid = (id) => mongoose.Types.ObjectId.isValid(id);
