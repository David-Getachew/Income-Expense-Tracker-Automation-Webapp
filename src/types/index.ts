export interface Transaction {
  id: number;
  item: string;
  quantity: number;
  pricePerUnit: number;
  entryType: 'Income' | 'Expense';
  category: 'Food' | 'Beverages' | 'Labor' | 'Supply' | 'Other';
  date: string;
}

export interface DailyStat {
  date: string;
  income: number;
  expense: number;
}

export interface TopItem {
  item: string;
  total: number;
}

export interface CategoryBreakdown {
  category: string;
  value: number;
}

export interface WeeklyReport {
  week: string;
  profit: number;
  analysis: string;
  reportUrl: string;
}

export interface User {
  email: string;
  isAuthenticated: boolean;
}