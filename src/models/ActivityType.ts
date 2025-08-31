import { Schema, model, Document } from 'mongoose';

export interface IActivityType extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activityTypeSchema = new Schema<IActivityType>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

activityTypeSchema.index({ name: 'text' });

export const ActivityType = model<IActivityType>('ActivityType', activityTypeSchema);
