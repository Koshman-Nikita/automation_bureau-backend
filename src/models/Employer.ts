import { Schema, model, Document } from 'mongoose';

export interface IEmployer extends Document {
  name: string;
  city?: string;
  contacts?: string;      // email/phone/website free text
  createdAt: Date;
  updatedAt: Date;
}

const employerSchema = new Schema<IEmployer>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    city: { type: String, trim: true },
    contacts: { type: String, trim: true },
  },
  { timestamps: true }
);

employerSchema.index({ name: 'text', city: 'text' });

export const Employer = model<IEmployer>('Employer', employerSchema);
