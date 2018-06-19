import mongoose from 'mongoose';

export default mongoose.model(
  'Article',
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        index: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      reference: {
        type: String,
        required: true,
        index: true,
        trim: true,
        uppercase: true,
      },
    },
    { timestamps: true },
  ),
);
