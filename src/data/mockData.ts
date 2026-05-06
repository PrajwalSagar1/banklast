export const BALANCE_CHART_DATA = [
  { date: '1 May', balance: 50000 },
  { date: '7 May', balance: 55000 },
  { date: '13 May', balance: 58000 },
  { date: '16 May', balance: 62750 },
  { date: '19 May', balance: 65000 },
  { date: '22 May', balance: 70000 },
  { date: '25 May', balance: 72000 },
  { date: '28 May', balance: 74000 },
  { date: '31 May', balance: 75250 },
];

export const RECENT_TRANSACTIONS = [
  {
    id: 1,
    description: 'Deposit from Self',
    date: '16 May 2025, 10:30 AM',
    amount: 20000,
    type: 'credit' as const,
  },
  {
    id: 2,
    description: 'Transfer to 9876 5432 1012',
    date: '15 May 2025, 05:20 PM',
    amount: -5000,
    type: 'debit' as const,
  },
  {
    id: 3,
    description: 'ATM Withdrawal',
    date: '15 May 2025, 01:15 PM',
    amount: -3000,
    type: 'debit' as const,
  },
  {
    id: 4,
    description: 'Deposit from Self',
    date: '14 May 2025, 11:00 AM',
    amount: 15000,
    type: 'credit' as const,
  },
  {
    id: 5,
    description: 'Transfer to 1111 2222 3333',
    date: '13 May 2025, 06:45 PM',
    amount: -2500,
    type: 'debit' as const,
  },
];

export const ALL_TRANSACTIONS = [
  {
    id: 1,
    datetime: '16 May 2025, 10:45 AM',
    description: 'Transfer to Arun Sharma',
    subDescription: 'HDFC Bank .... 1234',
    type: 'debit' as const,
    amount: -5000,
    balance: 75250.5,
  },
  {
    id: 2,
    datetime: '16 May 2025, 10:30 AM',
    description: 'Deposit from Self',
    subDescription: 'UPI/Net Banking',
    type: 'credit' as const,
    amount: 20000,
    balance: 80250.5,
  },
  {
    id: 3,
    datetime: '15 May 2025, 02:30 PM',
    description: 'Transfer to Priya Kapoor',
    subDescription: 'ICICI Bank .... 5678',
    type: 'debit' as const,
    amount: -2500,
    balance: 60250.5,
  },
  {
    id: 4,
    datetime: '14 May 2025, 11:20 AM',
    description: 'Deposit from Self',
    subDescription: 'UPI/Net Banking',
    type: 'credit' as const,
    amount: 15000,
    balance: 62750.5,
  },
  {
    id: 5,
    datetime: '13 May 2025, 09:15 AM',
    description: 'Transfer to Rohan Kumar',
    subDescription: 'SBI Bank .... 9012',
    type: 'debit' as const,
    amount: -3000,
    balance: 47750.5,
  },
  {
    id: 6,
    datetime: '12 May 2025, 04:45 PM',
    description: 'Deposit from Self',
    subDescription: 'UPI/Net Banking',
    type: 'credit' as const,
    amount: 10000,
    balance: 50750.5,
  },
];

export const RECENT_DEPOSITS = [
  { id: 1, description: 'Deposit from Self', date: '16 May 2025, 10:30 AM', amount: 20000 },
  { id: 2, description: 'Deposit from Self', date: '14 May 2025, 11:00 AM', amount: 15000 },
  { id: 3, description: 'Deposit from Self', date: '12 May 2025, 09:15 AM', amount: 10000 },
];

export const RECENT_WITHDRAWALS = [
  { id: 1, description: 'ATM Withdrawal', date: '15 May 2025, 01:15 PM', amount: 3000 },
  { id: 2, description: 'Transfer to 9876 5432 1012', date: '15 May 2025, 05:20 PM', amount: 5000 },
  { id: 3, description: 'ATM Withdrawal', date: '12 May 2025, 03:00 PM', amount: 2500 },
];

export const BENEFICIARIES = [
  { id: 1, initials: 'AS', name: 'Arun Sharma', bank: 'HDFC Bank .... 1234', color: '#7c3aed' },
  { id: 2, initials: 'PK', name: 'Priya Kapoor', bank: 'ICICI Bank .... 5678', color: '#10b981' },
  { id: 3, initials: 'RK', name: 'Rohan Kumar', bank: 'SBI Bank .... 9012', color: '#f97316' },
];

export const RECENT_TRANSFERS = [
  { id: 1, description: 'To Arun Sharma', date: '16 May 2025, 10:45 AM', amount: -5000 },
  { id: 2, description: 'To Priya Kapoor', date: '15 May 2025, 02:30 PM', amount: -2500 },
  { id: 3, description: 'From Rohan Kumar', date: '14 May 2025, 11:20 AM', amount: 3000 },
];

export const USER = {
  name: 'Gagana R',
  email: 'gagana.r@email.com',
  phone: '+91 98765 43210',
  dob: '15 August 1998',
  address: '123, 4th Cross Street, Bangalore, Karnataka - 560001',
  pan: 'ABCDE1234F',
  accountNumber: '1234 5678 9012',
  accountType: 'Savings Account',
  memberSince: '12 March 2024',
  balance: 75250.5,
  initials: 'GR',
};
