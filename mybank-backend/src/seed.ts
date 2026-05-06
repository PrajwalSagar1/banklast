import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.model';
import Transaction from './models/Transaction.model';
import Beneficiary from './models/Beneficiary.model';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({ email: 'gagana.r@email.com' });

  // Create user — pre-save hook hashes password and sets passwordChangedAt automatically
  const user = await User.create({
    fullName: 'Gagana R',
    email: 'gagana.r@email.com',
    password: 'password123',
    accountNumber: '123456789012',
    accountType: 'Savings Account',
    balance: 75250.50,
    phone: '+91 98765 43210',
    dateOfBirth: '15 August 1998',
    address: '123, 4th Cross Street, Bangalore, Karnataka - 560001',
    panNumber: 'ABCDE1234F',
    memberSince: new Date('2024-03-12'),
    lastLogin: new Date('2025-05-16T10:45:00'),
    lastDevice: 'Windows • Chrome',
  });

  // Override passwordChangedAt to the demo date (the hook sets it to now)
  user.passwordChangedAt = new Date('2025-05-12T10:00:00');
  await user.save();

  console.log(`Created user: ${user.email} (${user._id})`);

  // Clear old transactions and beneficiaries for this user
  await Transaction.deleteMany({ userId: user._id });
  await Beneficiary.deleteMany({ userId: user._id });

  const uid = user._id;

  const transactions = [
    // 1. Deposit 20000 — 16 May 10:30
    {
      userId: uid, type: 'credit', category: 'deposit',
      description: 'Deposit from Self', amount: 20000, balanceAfter: 80250.50,
      createdAt: new Date('2025-05-16T10:30:00'),
    },
    // 2. Transfer out to Arun Sharma 5000 — 16 May 10:45
    {
      userId: uid, type: 'debit', category: 'transfer_out',
      description: 'Transfer to Arun Sharma', amount: 5000, balanceAfter: 75250.50,
      beneficiaryName: 'Arun Sharma', beneficiaryBank: 'HDFC Bank',
      beneficiaryAccount: '987654321012',
      createdAt: new Date('2025-05-16T10:45:00'),
    },
    // 3. ATM Withdrawal 3000 — 15 May 13:15
    {
      userId: uid, type: 'debit', category: 'atm',
      description: 'ATM Withdrawal', amount: 3000, balanceAfter: 60250.50,
      createdAt: new Date('2025-05-15T13:15:00'),
    },
    // 4. Transfer out to Priya Kapoor 2500 — 15 May 14:30
    {
      userId: uid, type: 'debit', category: 'transfer_out',
      description: 'Transfer to Priya Kapoor', amount: 2500, balanceAfter: 62750.50,
      beneficiaryName: 'Priya Kapoor', beneficiaryBank: 'ICICI Bank',
      beneficiaryAccount: '567812345678',
      createdAt: new Date('2025-05-15T14:30:00'),
    },
    // 5. Deposit 15000 — 14 May 11:00
    {
      userId: uid, type: 'credit', category: 'deposit',
      description: 'Deposit from Self', amount: 15000, balanceAfter: 62750.50,
      createdAt: new Date('2025-05-14T11:00:00'),
    },
    // 6. Transfer in from Rohan Kumar 3000 — 14 May 11:20
    {
      userId: uid, type: 'credit', category: 'transfer_in',
      description: 'Transfer from Rohan Kumar', amount: 3000, balanceAfter: 47750.50,
      beneficiaryName: 'Rohan Kumar',
      createdAt: new Date('2025-05-14T11:20:00'),
    },
    // 7. Transfer out to Rohan Kumar 3000 — 13 May 09:15
    {
      userId: uid, type: 'debit', category: 'transfer_out',
      description: 'Transfer to Rohan Kumar', amount: 3000, balanceAfter: 47750.50,
      beneficiaryName: 'Rohan Kumar', beneficiaryBank: 'SBI Bank',
      beneficiaryAccount: '901290129012',
      createdAt: new Date('2025-05-13T09:15:00'),
    },
    // 8. Deposit 10000 — 12 May 16:45
    {
      userId: uid, type: 'credit', category: 'deposit',
      description: 'Deposit from Self', amount: 10000, balanceAfter: 50750.50,
      createdAt: new Date('2025-05-12T16:45:00'),
    },
  ];

  await Transaction.insertMany(transactions);
  console.log(`Created ${transactions.length} transactions`);

  // Seed beneficiaries
  const beneficiaries = [
    { userId: uid, name: 'Arun Sharma',  accountNumber: '987654321012', bankName: 'HDFC Bank',  ifscCode: 'HDFC0001234' },
    { userId: uid, name: 'Priya Kapoor', accountNumber: '567812345678', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678' },
    { userId: uid, name: 'Rohan Kumar',  accountNumber: '901290129012', bankName: 'SBI Bank',   ifscCode: 'SBIN0009012' },
  ];
  await Beneficiary.insertMany(beneficiaries);
  console.log(`Created ${beneficiaries.length} beneficiaries`);

  console.log('\n✅ Seed complete!');
  console.log('   Email:    gagana.r@email.com');
  console.log('   Password: password123');
  console.log('   Account:  123456789012');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
