import mongoose, { Document, Schema } from 'mongoose';

export interface IBeneficiary extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
  nickname?: string;
}

const BeneficiarySchema = new Schema<IBeneficiary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    ifscCode: { type: String, trim: true },
    nickname: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
