import { Schema, model, Document } from 'mongoose';

export interface IActivityType extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityTypeSchema = new Schema<IActivityType>(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IActivityType>('ActivityType', ActivityTypeSchema);
