import mongoose from "mongoose";

/**
 * @typedef {Object} Group
 * @property {mongoose.Types.ObjectId} _id
 * @property {string} name
 * @property {mongoose.Types.ObjectId} parent
 * @property {mongoose.Types.ObjectId[]} children
 * @property {mongoose.Types.ObjectId[]} ancestors
 * @property {mongoose.Types.ObjectId|null} _previousParent
 */

/**
 * @typedef {mongoose.Document & Group} GroupDocument
 */

const GroupSchema = /** @type {mongoose.Schema<Group>} */ (new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      set(parent) {
        const group = /** @type {GroupDocument} */ (this);
        group._previousParent = parent;
        return parent;
      }
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ],
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ]
  },
  {
    timestamps: true
  }
));

GroupSchema.index({ _id: 1, ancestors: 1 }, { unique: true });
GroupSchema.index({ _id: 1, children: 1 }, { unique: true });

/** @type {(group: GroupDocument) => Promise<mongoose.Types.ObjectId[]>} */
const getAncestors = async group => {
  if (!group.parent) {
    return;
  }
  const parent = /** @type {GroupDocument} */ (await Group.findById(
    group.parent
  ));
  return [...parent.ancestors, parent._id];
};

/** @type {(group: GroupDocument, parentId: mongoose.Types.ObjectId) => Promise<void>} */
const removeFromGroup = async (group, parentId) => {
  if (!parentId) {
    return;
  }
  await Group.updateOne(
    { _id: parentId },
    {
      $pull: { children: group._id }
    }
  );
};

/** @type {(group: GroupDocument, parentId: mongoose.Types.ObjectId) => Promise<void>} */
const addToGroup = async (group, parentId) => {
  if (!parentId) {
    return;
  }
  await Group.updateOne(
    { _id: parentId },
    {
      $push: { children: group._id }
    }
  );
};

/** @type {(group: GroupDocument) => Promise<void>} */
const validateNotNullParentExists = async group => {
  if (!group.parent) {
    return;
  }
  const parent = /** @type {GroupDocument} */ (await Group.findById(
    group.parent
  ));
  if (!parent) {
    throw new Error(
      `Parent ${Group.modelName} "${group.parent}" does not exist.`
    );
  }
};

/** @type {(group: GroupDocument) => Promise<void>} */
const validateParentIsNotSelf = async group => {
  if (group._id.equals(group.parent)) {
    throw new Error(`${Group.modelName} cannot be its own parent.`);
  }
};

/** @type {(ancestorId: mongoose.Types.ObjectId) => Promise<void>} */
const removeGroupsWithAncestor = async ancestorId => {
  await Group.deleteMany({ ancestors: ancestorId });
};

GroupSchema.pre("validate", async function(next) {
  const group = /** @type {GroupDocument} */ (this);
  try {
    await Promise.all([
      // Some validations are required on groups:
      // - if group parent is not null, it must exist
      validateNotNullParentExists(group),
      // - group parent must not be itself
      validateParentIsNotSelf(group)
    ]);
    return next();
  } catch (error) {
    return next(error);
  }
});

GroupSchema.pre("save", async function(next) {
  const group = /** @type {GroupDocument} */ (this);
  try {
    const [ancestors] = await Promise.all([
      // Before saving, we perform the following tasks:
      // - update group ancestors
      getAncestors(group),
      // - remove group from its previous parent's children (if it had one)
      removeFromGroup(group, group._previousParent),
      // - add group to its new parent's children (if it has one)
      addToGroup(group, group.parent)
    ]);
    group.ancestors = ancestors;
    return next();
  } catch (error) {
    return next(error);
  }
});

GroupSchema.pre("remove", async function(next) {
  const group = /** @type {GroupDocument} */ (this);
  try {
    await Promise.all([
      // Before removing, we perform the following tasks:
      // - remove group from its parent children
      removeFromGroup(group, group.parent),
      // - remove any group with the current group in its ancestors
      removeGroupsWithAncestor(group._id)
    ]);
    return next();
  } catch (error) {
    return next(error);
  }
});

export const Group = /** @type {mongoose.Model<GroupDocument>} */ (mongoose.model(
  "Group",
  GroupSchema
));
