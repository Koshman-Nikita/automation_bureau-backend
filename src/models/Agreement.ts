import { Schema, model, Document, Types } from 'mongoose';
import { Jobseeker } from './Jobseeker';
import { Vacancy } from './Vacancy';

export interface IAgreement extends Document {
  employerId: Types.ObjectId;
  jobseekerId: Types.ObjectId;
  vacancyId?: Types.ObjectId | null;
  position: string;
  commission?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const agreementSchema = new Schema<IAgreement>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true, index: true },
    jobseekerId: { type: Schema.Types.ObjectId, ref: 'Jobseeker', required: true, index: true },
    vacancyId:  { type: Schema.Types.ObjectId, ref: 'Vacancy', default: null },
    position:   { type: String, required: true, trim: true },
    commission: { type: Number, default: null },
  },
  { timestamps: true }
);

async function sideEffectsCloseVacancyAndMarkEmployed(doc: IAgreement | null) {
  try {
    if (!doc) return;

    const vId = doc.vacancyId ? doc.vacancyId.toString() : null;
    const jsId = doc.jobseekerId?.toString();

    if (vId) {
      await Vacancy.findByIdAndUpdate(
        vId,
        { $set: { status: 'closed' } },
        { new: false }
      );
      console.log('[Agreement hook] vacancy closed:', vId);
    }

    if (jsId) {
      await Jobseeker.findByIdAndUpdate(
        jsId,
        { $set: { status: 'employed' } },
        { new: false }
      );
      console.log('[Agreement hook] jobseeker employed:', jsId);
    }
  } catch (e) {
    console.error('[Agreement hook] side effects error:', e);
  }
}


agreementSchema.post('save', async function (doc) {
  await sideEffectsCloseVacancyAndMarkEmployed(doc);
});

agreementSchema.post('findOneAndUpdate', async function (resDoc: IAgreement | null) {
  await sideEffectsCloseVacancyAndMarkEmployed(resDoc);
});

agreementSchema.post('findOneAndDelete', async function (doc: IAgreement | null) {
  try {
    if (!doc) return;
    const jsId = doc.jobseekerId?.toString();
    if (jsId) {
      await Jobseeker.findByIdAndUpdate(jsId, { $set: { status: 'searching' } }, { new: false });
      console.log('[Agreement hook] jobseeker back to searching:', jsId);
    }
  } catch (e) {
    console.error('[Agreement hook] revert jobseeker failed:', e);
  }
});

export const Agreement = model<IAgreement>('Agreement', agreementSchema);
export default Agreement;
