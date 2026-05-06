import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

const generateAccountNumber = (): string => {
  let num = '';
  for (let i = 0; i < 12; i++) num += Math.floor(Math.random() * 10).toString();
  return num;
};

const parseDevice = (ua: string): string => {
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os/i.test(ua)) os = 'MacOS';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua)) browser = 'Opera';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return `${os} • ${browser}`;
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    let accountNumber = generateAccountNumber();
    while (await User.findOne({ accountNumber })) {
      accountNumber = generateAccountNumber();
    }

    const user = await User.create({ fullName, email, password, accountNumber });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { fullName: user.fullName, email: user.email, accountNumber: user.accountNumber },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const ua = req.headers['user-agent'] ?? '';
    user.lastLogin = new Date();
    user.lastDevice = parseDevice(ua);
    await user.save();

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        accountType: user.accountType,
        memberSince: user.memberSince,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};
