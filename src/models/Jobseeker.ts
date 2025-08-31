import { Schema, model, Document } from 'mongoose';

export interface IJobseeker extends Document {
  fullName: string;
  skills: string[];
  city?: string;
  salaryDesired?: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const jobseekerSchema = new Schema<IJobseeker>(
  {
    fullName: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    city: { type: String, trim: true },
    salaryDesired: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

jobseekerSchema.index({ fullName: 'text', skills: 'text', city: 'text' });

export const Jobseeker = model<IJobseeker>('Jobseeker', jobseekerSchema);
