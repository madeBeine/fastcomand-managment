import { 
  User, 
  Investor, 
  Expense, 
  Revenue, 
  Withdrawal, 
  OperationLog, 
  AppSettings,
  DashboardStats 
} from '../../shared/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    phone: '22234567',
    role: 'Admin',
    password: 'admin123'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    phone: '22345678',
    role: 'Assistant',
    password: 'assistant123'
  },
  {
    id: '3',
    name: 'محمد إبراهيم',
    phone: '22456789',
    role: 'Investor',
    password: 'investor123'
  }
];

export const mockInvestors: Investor[] = [
  {
    id: 'INV001',
    name: 'أحمد محمد',
    phone: '+222 12345678',
    sharePercentage: 25,
    totalInvested: 50000,
    totalProfit: 12500,
    totalWithdrawn: 5000,
    currentBalance: 7500,
    lastUpdated: '01/30/2024'
  },
  {
    id: 'INV002',
    name: 'فاطمة علي',
    phone: '+222 23456789',
    sharePercentage: 20,
    totalInvested: 40000,
    totalProfit: 10000,
    totalWithdrawn: 3000,
    currentBalance: 7000,
    lastUpdated: '01/30/2024'
  },
  {
    id: 'INV003',
    name: 'محمد عبد الله',
    phone: '+222 34567890',
    sharePercentage: 30,
    totalInvested: 60000,
    totalProfit: 15000,
    totalWithdrawn: 8000,
    currentBalance: 7000,
    lastUpdated: '01/30/2024'
  },
  {
    id: 'INV004',
    name: 'خديجة إبراهيم',
    phone: '+222 45678901',
    sharePercentage: 15,
    totalInvested: 30000,
    totalProfit: 7500,
    totalWithdrawn: 2000,
    currentBalance: 5500,
    lastUpdated: '01/30/2024'
  },
  {
    id: 'INV005',
    name: 'عمر حسن',
    phone: '+222 56789012',
    sharePercentage: 10,
    totalInvested: 20000,
    totalProfit: 5000,
    totalWithdrawn: 1500,
    currentBalance: 3500,
    lastUpdated: '01/30/2024'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: 'EXP001',
    category: 'مواد خام',
    amount: 15000,
    date: '1/15/2024',
    notes: 'شراء مواد للإنتاج',
    addedBy: 'أحمد الإدارة',
    timestamp: '2024-01-15T09:30:00.000Z',
    attachments: [
      { name: 'فاتورة_مواد_خام.pdf', size: 245760, type: 'application/pdf' }
    ]
  },
  {
    id: 'EXP002',
    category: 'رواتب',
    amount: 25000,
    date: '1/1/2024',
    notes: 'رواتب الموظفين لشهر يناير',
    addedBy: 'أحمد الإدارة',
    timestamp: '2024-01-01T10:00:00.000Z',
    attachments: []
  },
  {
    id: 'EXP003',
    category: 'إيجار',
    amount: 8000,
    date: '1/1/2024',
    notes: 'إيجار المكتب والمصنع',
    addedBy: 'أحمد الإدارة',
    timestamp: '2024-01-01T08:15:00.000Z',
    attachments: [
      { name: 'عقد_الإيجار.pdf', size: 512000, type: 'application/pdf' }
    ]
  },
  {
    id: 'EXP004',
    category: 'كهرباء',
    amount: 3500,
    date: '1/10/2024',
    notes: 'فاتو��ة الكهرباء',
    addedBy: 'فاطمة المحاسبة',
    timestamp: '2024-01-10T14:20:00.000Z',
    attachments: [
      { name: 'فاتورة_كهرباء_يناير.jpg', size: 1024000, type: 'image/jpeg' }
    ]
  },
  {
    id: 'EXP005',
    category: 'نقل ومواصلات',
    amount: 2000,
    date: '1/20/2024',
    notes: 'تكاليف النقل والتوصيل',
    addedBy: 'محمد العمليات',
    timestamp: '2024-01-20T16:45:00.000Z',
    attachments: []
  }
];

export const mockRevenues: Revenue[] = [
  {
    id: '1',
    amount: 50000,
    date: '1/31/2024',
    description: 'مبيعات الشهر',
    addedBy: 'أحمد محمد'
  },
  {
    id: '2',
    amount: 30000,
    date: '2/15/2024',
    description: 'خدمات استشارية',
    addedBy: 'فاطمة علي'
  },
  {
    id: '3',
    amount: 25000,
    date: '2/20/2024',
    description: 'عقد صيانة',
    addedBy: 'أحمد محمد'
  },
  {
    id: '4',
    amount: 40000,
    date: '2/25/2024',
    description: 'مشروع جديد',
    addedBy: 'أحمد محمد'
  },
  {
    id: '5',
    amount: 20000,
    date: '3/1/2024',
    description: 'عمولات',
    addedBy: 'فاطمة علي'
  }
];

export const mockWithdrawals: Withdrawal[] = [
  {
    id: '1',
    investorName: 'أحمد محمد',
    amount: 5000,
    date: '2/1/2024',
    notes: 'سحب أرباح',
    approvedBy: 'أحمد محمد'
  },
  {
    id: '2',
    investorName: 'فاطمة علي',
    amount: 3000,
    date: '2/15/2024',
    notes: 'سحب جزئي',
    approvedBy: 'أحمد محمد'
  }
];

export const mockOperationsLog: OperationLog[] = [
  {
    id: '1',
    operationType: 'إضافة مستثمر',
    details: 'تم إضافة مستثمر جديد: يوسف عبدالله',
    date: new Date().toLocaleString('en-US'),
    performedBy: 'أحمد محمد'
  },
  {
    id: '2',
    operationType: 'تحديث إيراد',
    details: 'تم إضافة إيراد جديد بقيمة 50000 MRU',
    date: new Date().toLocaleString('en-US'),
    performedBy: 'أحمد محمد'
  }
];

export const mockSettings: AppSettings = {
  projectPercentage: 15, // Changed to 15% as requested
  currency: 'MRU',
  enableGoogleDriveLink: true,
  enableAIInsights: true,
  googleDriveId: '147eIKFhqjBW3E-ybO-k9vMH2KMGtilIP',
  openAiKey: 'sk-proj-YqHE3DxVZSWFfYFKXDSE-pbbArHYg5zUkzxSGzJkgdX7iQqB2L_pc1aliK-_HwGcirnDRGBY_4T3BlbkFJaUhZVuQcoVw4n1V8pLLgvCQBWJbh0IOWHTiZnI-6IBClt1XE6XmUz5n9xoZAff1Hm-iV74HkJUA',
  sheetId: '1qU6wQ7KN3LoU_1atvbxSDLshYXZZ_DixgCBDcAcTfJA', // Updated with your provided sheet ID
  lastSync: '01/30/2024, 02:30:00 PM',
  aiSyncInterval: 2
};

export function calculateDashboardStats(): DashboardStats {
  const totalRevenue = mockRevenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalWithdrawals = mockWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Calculate net profit first (revenues - expenses)
  const netProfit = totalRevenue - totalExpenses;

  // Project gets 15% of net profit
  const projectProfit = netProfit * (mockSettings.projectPercentage / 100);

  // Remaining 85% goes to investors
  const investorsShare = netProfit - projectProfit;

  return {
    totalRevenue,
    totalExpenses,
    totalProfit: netProfit, // This is now net profit (revenues - expenses)
    totalWithdrawals,
    activeInvestors: mockInvestors.length,
    monthlyGrowth: 12.5,
    pendingApprovals: 0,
    projectBalance: projectProfit,
    availableBalance: investorsShare - totalWithdrawals
  };
}
