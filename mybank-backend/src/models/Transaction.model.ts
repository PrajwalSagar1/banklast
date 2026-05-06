import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  category: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'atm';
  description: string;
  amount: number;
  balanceAfter: number;
  beneficiaryName?: string;
  beneficiaryAccount?: string;
  beneficiaryBank?: string;
  paymentMethod?: string;
  remarks?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    category: {
      type: String,
      enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'atm'],
      required: true,
    },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    beneficiaryName: { type: String },
    beneficiaryAccount: { type: String },
    beneficiaryBank: { type: String },
    paymentMethod: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
