import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Beneficiary from '../models/Beneficiary.model';

export const getBeneficiaries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const beneficiaries = await Beneficiary.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, beneficiaries });
  } catch (error) {
    next(error);
  }
};

export const addBeneficiary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, accountNumber, bankName, ifscCode, nickname } = req.body;

    if (!name || !accountNumber || !bankName) {
      res.status(400).json({ success: false, message: 'Name, account number and bank name are required' });
      return;
    }

    const existing = await Beneficiary.findOne({ userId: req.user!.userId, accountNumber });
    if (existing) {
      res.status(409).json({ success: false, message: 'Beneficiary with this account number already exists' });
      return;
    }

    const beneficiary = await Beneficiary.create({
      userId: req.user!.userId,
      name,
      accountNumber,
      bankName,
      ifscCode,
      nickname,
    });

    res.status(201).json({ success: true, beneficiary });
  } catch (error) {
    next(error);
  }
};

export const deleteBeneficiary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const beneficiary = await Beneficiary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!beneficiary) {
      res.status(404).json({ success: false, message: 'Beneficiary not found' });
      return;
    }

    res.json({ success: true, message: 'Beneficiary removed' });
  } catch (error) {
    next(error);
  }
};
