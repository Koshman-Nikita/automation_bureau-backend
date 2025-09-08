import { Schema, model, Document, Types } from 'mongoose';

export type VacancyStatus = 'open' | 'closed';

export interface IVacancy extends Document {
  employerId: Types.ObjectId;    
  title: string;                
  position: string;           
  activityType?: string | null;   
  skills: string[];               
  salary?: number | null;        
  status: VacancyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<IVacancy>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true, index: true },
    title: { type: String, required: true, trim: true },
    position: { type: String, trim: true }, 
    activityType: { type: String, default: null, index: true },
    skills: { type: [String], default: [], index: true },
    salary: { type: Number, default: null },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  },
  { timestamps: true }
);

vacancySchema.pre('save', function (next) {
  if (!this.position || !this.position.trim()) {
    this.position = this.title?.trim() ?? '';
  }
  next();
});

vacancySchema.index({
  title: 'text',
  position: 'text',
  activityType: 'text',
  skills: 'text',
});

export const Vacancy = model<IVacancy>('Vacancy', vacancySchema);
export default Vacancy;
