import { Schema, model, Document, Types } from 'mongoose';

export interface IVacancy extends Document {
  title: string;
  employerId: Types.ObjectId;
  skills?: string[];       
  salaryMin?: number;
  salaryMax?: number;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<IVacancy>(
  {
    title: { type: String, required: true, trim: true },
    employerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true, index: true },
    skills: { type: [String], default: [] },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  },
  { timestamps: true }
);

vacancySchema.index({ title: 'text', skills: 'text' });

export const Vacancy = model<IVacancy>('Vacancy', vacancySchema);
