import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Transaction from '../models/Transaction.model';
import User from '../models/User.model';

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { type, startDate, endDate, page = '1', limit = '10' } = req.query;

    const filter: Record<string, unknown> = { userId };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, Date>).$lte = end;
      }
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      transactions,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeposits = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const deposits = await Transaction.find({ userId, type: 'credit', category: 'deposit' })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, deposits });
  } catch (error) {
    next(error);
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const withdrawals = await Transaction.find({
      userId,
      type: 'debit',
      category: { $in: ['withdrawal', 'atm'] },
    })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    next(error);
  }
};

export const getTransfers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const recentTransfers = await Transaction.find({
      userId,
      category: { $in: ['transfer_in', 'transfer_out'] },
    }).sort({ createdAt: -1 }).limit(10);

    // Build unique beneficiaries from transfer_out transactions
    const outgoing = await Transaction.find({ userId, category: 'transfer_out' });
    const seen = new Set<string>();
    const beneficiaries: { name: string; account: string; bank: string }[] = [];
    for (const tx of outgoing) {
      if (tx.beneficiaryAccount && !seen.has(tx.beneficiaryAccount)) {
        seen.add(tx.beneficiaryAccount);
        beneficiaries.push({
          name: tx.beneficiaryName || '',
          account: tx.beneficiaryAccount,
          bank: tx.beneficiaryBank || '',
        });
      }
    }

    res.status(200).json({ success: true, recentTransfers, beneficiaries });
  } catch (error) {
    next(error);
  }
};

export const getBalanceOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId).select('balance');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    // Get this month's transactions sorted oldest-first to build running balance
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const txs = await Transaction.find({
      userId,
      createdAt: { $gte: monthStart },
    }).sort({ createdAt: 1 });

    // Reconstruct opening balance by walking backwards from current balance
    const totalNetThisMonth = txs.reduce((acc, tx) => {
      return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
    }, 0);
    let runningBalance = parseFloat((user.balance - totalNetThisMonth).toFixed(2));

    // Build chart points: one per day that has transactions
    const dayMap = new Map<string, number>();
    for (const tx of txs) {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      runningBalance = tx.type === 'credit'
        ? parseFloat((runningBalance + tx.amount).toFixed(2))
        : parseFloat((runningBalance - tx.amount).toFixed(2));
      dayMap.set(dateKey, runningBalance);
    }

    const chartData = Array.from(dayMap.entries()).map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      balance,
    }));

    // Prepend opening balance on day 1 if we have data
    if (chartData.length > 0) {
      const openingBalance = parseFloat((user.balance - totalNetThisMonth).toFixed(2));
      chartData.unshift({
        date: new Date(monthStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        balance: openingBalance,
      });
    }

    res.status(200).json({ success: true, chartData });
  } catch (error) {
    next(error);
  }
};
