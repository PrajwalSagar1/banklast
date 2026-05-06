import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User.model';
import Transaction from '../models/Transaction.model';

const startOfMonth = (): Date => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    const [recentTransactions, monthlyCreditAgg, monthlyDebitAgg] = await Promise.all([
      Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'credit', createdAt: { $gte: startOfMonth() } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'debit', createdAt: { $gte: startOfMonth() } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      balance: user.balance,
      accountNumber: user.accountNumber,
      accountType: user.accountType,
      totalCredited: monthlyCreditAgg[0]?.total ?? 0,
      totalDebited: monthlyDebitAgg[0]?.total ?? 0,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

export const deposit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amount, paymentMethod, description } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    user.balance = parseFloat((user.balance + Number(amount)).toFixed(2));
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'credit',
      category: 'deposit',
      description: description || 'Deposit from Self',
      amount: Number(amount),
      balanceAfter: user.balance,
      paymentMethod,
    });

    res.status(200).json({ success: true, newBalance: user.balance, transaction });
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amount, paymentMethod, description } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    if (user.balance < Number(amount)) {
      res.status(400).json({ success: false, message: 'Insufficient balance' });
      return;
    }

    user.balance = parseFloat((user.balance - Number(amount)).toFixed(2));
    await user.save();

    const isATM = (description || '').toLowerCase().includes('atm');
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'debit',
      category: isATM ? 'atm' : 'withdrawal',
      description: description || 'Withdrawal',
      amount: Number(amount),
      balanceAfter: user.balance,
      paymentMethod,
    });

    res.status(200).json({ success: true, newBalance: user.balance, transaction });
  } catch (error) {
    next(error);
  }
};

export const transfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { beneficiaryAccount, beneficiaryName, beneficiaryBank, amount, remarks } = req.body;

    if (!beneficiaryAccount || !beneficiaryName || !amount) {
      res.status(400).json({ success: false, message: 'beneficiaryAccount, beneficiaryName and amount are required' });
      return;
    }

    if (Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
      return;
    }

    const sender = await User.findById(userId);
    if (!sender) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    if (sender.balance < Number(amount)) {
      res.status(400).json({ success: false, message: 'Insufficient balance' });
      return;
    }

    sender.balance = parseFloat((sender.balance - Number(amount)).toFixed(2));
    await sender.save();

    const debitTx = await Transaction.create({
      userId: sender._id,
      type: 'debit',
      category: 'transfer_out',
      description: `Transfer to ${beneficiaryName}`,
      amount: Number(amount),
      balanceAfter: sender.balance,
      beneficiaryName,
      beneficiaryAccount,
      beneficiaryBank: beneficiaryBank || '',
      remarks,
    });

    // Credit beneficiary if they exist in our DB
    const beneficiary = await User.findOne({ accountNumber: beneficiaryAccount });
    if (beneficiary) {
      beneficiary.balance = parseFloat((beneficiary.balance + Number(amount)).toFixed(2));
      await beneficiary.save();

      await Transaction.create({
        userId: beneficiary._id,
        type: 'credit',
        category: 'transfer_in',
        description: `Transfer from ${sender.fullName}`,
        amount: Number(amount),
        balanceAfter: beneficiary.balance,
        beneficiaryName: sender.fullName,
        beneficiaryAccount: sender.accountNumber,
        beneficiaryBank: 'MyBank',
        remarks,
      });
    }

    res.status(200).json({ success: true, newBalance: sender.balance, transaction: debitTx });
  } catch (error) {
    next(error);
  }
};
