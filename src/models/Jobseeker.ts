import { Schema, model, Document } from 'mongoose';

export type JobseekerStatus = 'searching' | 'employed';

export interface IJobseeker extends Document {
  fullName: string;
  qualifications: string[];  
  activityType?: string | null; 
  city?: string;
  salaryDesired?: number | null;
  status: JobseekerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const jobseekerSchema = new Schema<IJobseeker>(
  {
    fullName: { type: String, required: true, trim: true },
    qualifications: { type: [String], default: [], index: true },
    activityType: { type: String, default: null, index: true },
    city: { type: String, trim: true },
    salaryDesired: { type: Number, default: null },
    status: { type: String, enum: ['searching', 'employed'], default: 'searching', index: true },
  },
  { timestamps: true }
);

// текстовий пошук
jobseekerSchema.index({
  fullName: 'text',
  qualifications: 'text',
  activityType: 'text',
  city: 'text',
});

export const Jobseeker = model<IJobseeker>('Jobseeker', jobseekerSchema);
export default Jobseeker;
