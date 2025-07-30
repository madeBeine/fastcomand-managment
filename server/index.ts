import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleLogout,
  handleVerifyToken,
  authenticateRequest,
  getUserPermissions
} from "./routes/auth";
import {
  handleGetDashboard,
  handleGetInvestors,
  handleGetExpenses,
  handleGetRevenues,
  handleGetWithdrawals,
  handleGetProjectWithdrawals,
  handleSyncData
} from "./routes/data";
import {
  handleAddInvestor,
  handleUpdateInvestor,
  handleDeleteInvestor,
  handleAddExpense as handleAddExpenseCrud,
  handleUpdateExpense,
  handleDeleteExpense,
  handleAddRevenue as handleAddRevenueCrud,
  handleUpdateRevenue,
  handleDeleteRevenue,
  handleAddWithdrawal as handleAddWithdrawalCrud,
  handleUpdateWithdrawal,
  handleDeleteWithdrawal,
  handleAddProjectWithdrawal,
  handleUpdateProjectWithdrawal,
  handleDeleteProjectWithdrawal,
  handleAddUser,
  handleUpdateUser,
  handleDeleteUser
} from "./routes/crud";
import insightsRouter from "./routes/insights";
import settingsRouter, { loadSettings } from "./routes/settings";
import { initializeDatabase } from "./startup";

export function createServer() {
  const app = express();

  // Initialize database once
  initializeDatabase();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware (only for development)
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/auth')) {
        console.log(`🌐 ${req.method} ${req.path}`);
      }
      next();
    });
  }

  // Request logging for debugging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body ? 'with body' : 'no body');
    next();
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: 'خطأ داخلي في الخا��م'
    });
  });

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Debug endpoint to test API connectivity
  app.get("/api/debug", (_req, res) => {
    res.json({
      success: true,
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      server: "Express"
    });
  });

  // List all available routes
  app.get("/api/routes", (_req, res) => {
    const routes = [
      "GET /api/ping",
      "GET /api/debug",
      "GET /api/routes",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/verify",
      "GET /api/dashboard",
      "GET /api/investors",
      "GET /api/expenses",
      "GET /api/revenues",
      "GET /api/withdrawals",
      "GET /api/settings",
      "POST /api/settings/save"
    ];

    res.json({
      success: true,
      message: "Available API routes",
      routes: routes,
      total: routes.length
    });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/verify", handleVerifyToken);

  // Protected data routes
  app.get("/api/dashboard", authenticateRequest, handleGetDashboard);
  app.get("/api/dashboard/stats", authenticateRequest, async (req, res) => {
    try {
      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();

      // Load current settings
      const currentSettings = loadSettings();

      const stats = await dbService.getDashboardStats(currentSettings);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'ح��ث خطأ أثناء تحميل الإحصائيات'
      });
    }
  });
  app.get("/api/investors", authenticateRequest, handleGetInvestors);
  app.get("/api/expenses", authenticateRequest, handleGetExpenses);
  app.get("/api/revenues", authenticateRequest, handleGetRevenues);
  app.get("/api/withdrawals", authenticateRequest, handleGetWithdrawals);
  app.get("/api/project-withdrawals", authenticateRequest, handleGetProjectWithdrawals);

  // Operations log
  app.get("/api/operations-log", authenticateRequest, async (req, res) => {
    try {
      console.log('📋 Operations log endpoint called');
      const user = (req as any).user;
      console.log('👤 User:', user?.name, 'Role:', user?.role);

      const permissions = getUserPermissions(user.role);
      console.log('🔐 Permissions:', permissions);

      if (!permissions.canViewAllData && user.role !== 'Admin') {
        console.log('❌ Access denied for user:', user.name);
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لعرض سجل العمليات'
        });
      }

      console.log('🔍 Fetching operations log...');
      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();

      try {
        const operationsLog = await dbService.getOperationsLog();
        console.log('📊 Operations log fetched:', operationsLog?.length, 'entries');

        // If no data, return empty array but successful
        if (!operationsLog || operationsLog.length === 0) {
          console.log('📝 No operations log data found');
          return res.json({
            success: true,
            data: []
          });
        }

        return res.json({
          success: true,
          data: operationsLog
        });
      } catch (dbError) {
        console.error('🗄️ Database error:', dbError);
        // If table doesn't exist, return empty array
        if (dbError instanceof Error && dbError.message.includes('does not exist')) {
          console.log('📝 Operations log table does not exist, returning empty data');
          return res.json({
            success: true,
            data: []
          });
        }
        throw dbError;
      }
    } catch (error) {
      console.error('❌ Operations log error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحميل سجل العمليات',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Data modification routes
  // Investors CRUD
  app.post("/api/investors", authenticateRequest, handleAddInvestor);
  app.put("/api/investors", authenticateRequest, handleUpdateInvestor);
  app.delete("/api/investors", authenticateRequest, handleDeleteInvestor);

  // Expenses CRUD
  app.post("/api/expenses", authenticateRequest, handleAddExpenseCrud);
  app.put("/api/expenses", authenticateRequest, handleUpdateExpense);
  app.delete("/api/expenses", authenticateRequest, handleDeleteExpense);

  // Revenues CRUD
  app.post("/api/revenues", authenticateRequest, handleAddRevenueCrud);
  app.put("/api/revenues", authenticateRequest, handleUpdateRevenue);
  app.delete("/api/revenues", authenticateRequest, handleDeleteRevenue);

  // Withdrawals CRUD
  app.post("/api/withdrawals", authenticateRequest, handleAddWithdrawalCrud);
  app.put("/api/withdrawals", authenticateRequest, handleUpdateWithdrawal);
  app.delete("/api/withdrawals", authenticateRequest, handleDeleteWithdrawal);

  // Project Withdrawals CRUD
  app.post("/api/project-withdrawals", authenticateRequest, handleAddProjectWithdrawal);
  app.put("/api/project-withdrawals", authenticateRequest, handleUpdateProjectWithdrawal);
  app.delete("/api/project-withdrawals", authenticateRequest, handleDeleteProjectWithdrawal);

  // Investor profile endpoint
  app.get("/api/investor/profile", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Investor') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية ل��رض هذه البيانات'
        });
      }

      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();

      // Get investor data with effective profits
      const { loadSettings } = await import('./routes/settings');
      const currentSettings = loadSettings();
      const investors = await dbService.getInvestorsWithEffectiveProfits(currentSettings);
      const investorData = investors.find(inv => inv.name === user.name);

      if (!investorData) {
        return res.status(404).json({
          success: false,
          message: 'لم يتم العثور على بيانات المستثمر'
        });
      }

      // Get investor's withdrawals
      const withdrawals = await dbService.getWithdrawals();
      const investorWithdrawals = withdrawals.filter(w => w.investorName === user.name);

      res.json({
        success: true,
        data: {
          profile: investorData,
          withdrawals: investorWithdrawals
        }
      });
    } catch (error) {
      console.error('Get investor profile error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب بيانات المستثمر'
      });
    }
  });

  // AI Insights routes
  app.use(insightsRouter);

  // Settings routes
  app.use(settingsRouter);

  // Users CRUD
  app.get("/api/users", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لعرض المستخدمين'
        });
      }

      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();
      const users = await dbService.getUsers();

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب المستخد��ين'
      });
    }
  });

  app.post("/api/users", authenticateRequest, handleAddUser);
  app.put("/api/users", authenticateRequest, handleUpdateUser);
  app.delete("/api/users", authenticateRequest, handleDeleteUser);
  
  // Data synchronization
  app.post("/api/sync", authenticateRequest, handleSyncData);

  // Test operation log
  app.post("/api/test-operation-log", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;
      console.log('🧪 Test operation log - User:', user);

      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();

      await dbService.addOperationLog({
        id: 'TEST' + Date.now(),
        operationType: 'اختبار النظام',
        details: `تم إجراء اختبار سجل العمليات من قبل ${user.name} في ${new Date().toLocaleString('ar-SA')}`,
        date: new Date().toLocaleString('ar-SA'),
        performedBy: user.name
      });

      res.json({
        success: true,
        message: 'تم إضافة عملية الاختبار بنجاح',
        user: user.name
      });

    } catch (error) {
      console.error('Test operation error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إضافة عملية الاختبار'
      });
    }
  });

  // Database information and testing
  app.get("/api/database/info", authenticateRequest, async (req, res) => {
    try {
      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();
      const info = dbService.getDatabaseInfo();
      const connectionTest = await dbService.testConnection();

      res.json({
        success: true,
        data: {
          ...info,
          connectionTest
        }
      });
    } catch (error) {
      console.error('Database info error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في الحصول على معلومات قاعدة البيانات'
      });
    }
  });

  app.post("/api/database/migrate", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك ��لاحية لنقل البيانات'
        });
      }

      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();
      const result = await dbService.migrateToSupabase();

      res.json(result);
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في نقل البيانات'
      });
    }
  });

  app.post("/api/database/force-supabase", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لتغيير قاعدة البيانات'
        });
      }

      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();
      const result = await dbService.forceSupabaseMode();

      res.json(result);
    } catch (error) {
      console.error('Force Supabase error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تفعيل Supabase'
      });
    }
  });

  app.post("/api/database/initialize", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلا��ية لته��ئة قاعدة البيانات'
        });
      }

      const { default: DatabaseService } = await import('./services/databaseService');
      const dbService = new DatabaseService();
      const result = await dbService.initializeDatabase();

      if (result) {
        res.json({
          success: true,
          message: 'تم تهيئة قاعدة ا��بيانات بنجاح'
        });
      } else {
        res.json({
          success: false,
          message: 'فشل في تهيئة قاعدة البيانات'
        });
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تهيئة قاعدة البيانات'
      });
    }
  });

  // Data backup and restore endpoints
  app.post("/api/backup/create", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لإنشاء نسخة احتياطية'
        });
      }

      const { dataBackupService } = await import('./services/dataBackup');
      const result = dataBackupService.createJsonBackup();

      res.json(result);
    } catch (error) {
      console.error('Backup creation error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إنشاء النسخة الاحت��اطية'
      });
    }
  });

  app.get("/api/backup/list", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صل��حية لعرض النسخ الاحتياطية'
        });
      }

      const { dataBackupService } = await import('./services/dataBackup');
      const backups = dataBackupService.listBackups();

      res.json({
        success: true,
        data: backups,
        message: `تم العثور على ${backups.length} نسخة احتياطية`
      });
    } catch (error) {
      console.error('List backups error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خط�� أثناء جلب قائمة النسخ الاحتياطية'
      });
    }
  });

  app.post("/api/backup/restore", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لاستعادة النسخ الاحتياطية'
        });
      }

      const { backupFileName } = req.body;
      if (!backupFileName) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحد��د اسم ملف النسخة الاحتياطية'
        });
      }

      const { dataBackupService } = await import('./services/dataBackup');
      const result = dataBackupService.restoreFromBackup(backupFileName);

      res.json(result);
    } catch (error) {
      console.error('Restore backup error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء استعادة النسخة الاحتياطية'
      });
    }
  });

  app.get("/api/export", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لتصدير البيانات'
        });
      }

      const { dataBackupService } = await import('./services/dataBackup');
      const result = dataBackupService.exportForDownload();

      if (result.success) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="investment-data-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(result.data);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تصدير الب��انات'
      });
    }
  });

  app.post("/api/import", authenticateRequest, async (req, res) => {
    try {
      const user = (req as any).user;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لاستيراد البيانات'
        });
      }

      const { dataBackupService } = await import('./services/dataBackup');
      const result = dataBackupService.importData(req.body);

      res.json(result);
    } catch (error) {
      console.error('Import data error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء استيراد البيانات'
      });
    }
  });

  // Global error handlers
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process in development, just log the error
  });

  return app;
}
