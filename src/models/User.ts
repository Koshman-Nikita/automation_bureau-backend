import { Schema, model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'manager' | 'employer' | 'jobseeker';

export interface IUser {
  email: string;
  password: string;     
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['admin', 'manager', 'employer', 'jobseeker'], default: 'manager' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  const doc = this as HydratedDocument<IUser>;
  if (!doc.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  doc.password = await bcrypt.hash(doc.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

const User = model<IUser>('User', UserSchema);
export type UserDoc = HydratedDocument<IUser>;
export default User;
