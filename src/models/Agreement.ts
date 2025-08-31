import { Schema, model, Document, Types } from 'mongoose';

export interface IAgreement extends Document {
  vacancyId: Types.ObjectId;
  jobseekerId: Types.ObjectId;
  date: Date;
  commissionPct?: number;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const agreementSchema = new Schema<IAgreement>(
  {
    vacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy', required: true, index: true },
    jobseekerId: { type: Schema.Types.ObjectId, ref: 'Jobseeker', required: true, index: true },
    date: { type: Date, required: true },
    commissionPct: { type: Number },
    amount: { type: Number },
  },
  { timestamps: true }
);

agreementSchema.index({ date: 1 });

export const Agreement = model<IAgreement>('Agreement', agreementSchema);
