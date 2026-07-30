import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    color: { type: String, default: "#059669" },
    icon: { type: String, default: "folder" },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", CategorySchema);
export default Category;
