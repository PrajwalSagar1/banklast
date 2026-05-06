import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User.model';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, phone, dateOfBirth, address, panNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { fullName, phone, dateOfBirth, address, panNumber },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
