import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'manager' | 'employer' | 'jobseeker';

export interface IUser extends Document {
  email: string;
  password?: string; // select: false
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'manager', 'employer', 'jobseeker'], required: true },
  },
  { timestamps: true }
);

//pre-save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

export default model<IUser>('User', userSchema);
