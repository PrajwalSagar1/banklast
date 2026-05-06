import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  panNumber?: string;
  kycStatus: string;
  memberSince: Date;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  lastDevice?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    accountNumber: { type: String, unique: true, required: true },
    accountType: { type: String, default: 'Savings Account' },
    balance: { type: Number, default: 0 },
    phone: { type: String },
    dateOfBirth: { type: String },
    address: { type: String },
    panNumber: { type: String },
    kycStatus: { type: String, default: 'Completed' },
    memberSince: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: true },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    lastDevice: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = new Date();
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
