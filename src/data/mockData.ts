import { Transaction, DailyStat, TopItem, CategoryBreakdown, WeeklyReport } from '@/types';

export const mockTransactions: Transaction[] = [
  { id: 1, item: "Injera", quantity: 50, pricePerUnit: 5, entryType: "Income", category: "Food", date: "2025-09-10" },
  { id: 2, item: "Oil", quantity: 10, pricePerUnit: 80, entryType: "Expense", category: "Supply", date: "2025-09-10" },
  { id: 3, item: "Samosa", quantity: 30, pricePerUnit: 10, entryType: "Income", category: "Food", date: "2025-09-11" },
  { id: 4, item: "Labor Wages", quantity: 1, pricePerUnit: 500, entryType: "Expense", category: "Labor", date: "2025-09-11" },
  { id: 5, item: "Falafel Sandwich", quantity: 20, pricePerUnit: 25, entryType: "Income", category: "Food", date: "2025-09-12" },
  { id: 6, item: "Gas Cylinder", quantity: 1, pricePerUnit: 350, entryType: "Expense", category: "Supply", date: "2025-09-12" },
  { id: 7, item: "Soft Drinks", quantity: 15, pricePerUnit: 15, entryType: "Income", category: "Beverages", date: "2025-09-13" },
  { id: 8, item: "Potatoes", quantity: 25, pricePerUnit: 12, entryType: "Expense", category: "Supply", date: "2025-09-13" },
  { id: 9, item: "Shiro Stew", quantity: 10, pricePerUnit: 30, entryType: "Income", category: "Food", date: "2025-09-14" },
  { id: 10, item: "Water Bottles", quantity: 20, pricePerUnit: 8, entryType: "Expense", category: "Supply", date: "2025-09-14" }
];

export const mockDailyStats: DailyStat[] = [
  { date: "2025-09-10", income: 250, expense: 800 },
  { date: "2025-09-11", income: 300, expense: 500 },
  { date: "2025-09-12", income: 500, expense: 350 },
  { date: "2025-09-13", income: 225, expense: 300 },
  { date: "2025-09-14", income: 300, expense: 160 },
  { date: "2025-09-15", income: 450, expense: 200 },
  { date: "2025-09-16", income: 400, expense: 250 }
];

export const mockTopItems: TopItem[] = [
  { item: "Injera", total: 250 },
  { item: "Falafel Sandwich", total: 500 },
  { item: "Samosa", total: 300 },
  { item: "Shiro Stew", total: 300 },
  { item: "Soft Drinks", total: 225 }
];

export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: "Food", value: 1350 },
  { category: "Beverages", value: 225 },
  { category: "Labor", value: 500 },
  { category: "Supply", value: 1410 },
  { category: "Other", value: 0 }
];

export const mockWeeklyReports: WeeklyReport[] = [
  {
    week: "2025-09-01 to 2025-09-07",
    profit: 850,
    analysis: "Sales were strongest mid-week, especially for falafel and injera. Expenses were stable, with labor as the largest category.",
    reportUrl: "/reports/week1.pdf"
  },
  {
    week: "2025-09-08 to 2025-09-14",
    profit: 765,
    analysis: "Shiro stew and samosas showed consistent demand. High expenses came from supply restocking.",
    reportUrl: "/reports/week2.pdf"
  },
  {
    week: "2025-09-15 to 2025-09-21",
    profit: 940,
    analysis: "Beverage sales increased significantly. Profit margins improved after reduced supply expenses.",
    reportUrl: "/reports/week3.pdf"
  }
];