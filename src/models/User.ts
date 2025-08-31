import { Schema, model, Document } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'employer' | 'jobseeker';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employer', 'jobseeker'], default: 'manager', index: true },
  },
  { timestamps: true }
);

import bcrypt from 'bcryptjs';
userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
