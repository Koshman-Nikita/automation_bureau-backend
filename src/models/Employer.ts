import { Schema, model, Document } from 'mongoose';

export interface IEmployer extends Document {
  name: string;
  activityType?: string | null; 
  phone?: string | null;
  address?: string | null;     
  city?: string | null;      
  createdAt: Date;
  updatedAt: Date;
}

const employerSchema = new Schema<IEmployer>(
  {
    name: { type: String, required: true, trim: true, index: true },
    activityType: { type: String, default: null, index: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

employerSchema.index({
  name: 'text',
  activityType: 'text',
  address: 'text',
  city: 'text',
});

export const Employer = model<IEmployer>('Employer', employerSchema);
export default Employer;
