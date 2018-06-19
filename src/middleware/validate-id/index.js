import { BAD_REQUEST } from 'http-status';
import mongoose from 'mongoose';

export default function validateId() {
  return (req, res, next, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next({ status: BAD_REQUEST, message: `Invalid id "${id}"` });
    }
    return next();
  };
}
