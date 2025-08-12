import { RequestHandler } from "express";
import { getUserPermissions } from "./auth";
import { DashboardStats } from "../../shared/types";
import {
  calculateDashboardStats
} from "../services/mockData";
import { databaseService } from "../services/databaseService";

// Use the singleton Database Service instance
const database = databaseService;

export const handleGetDashboard: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    // Check permissions
    if (!permissions.canViewAllData && user.role !== 'Investor') {
      return res.status(403).json({
        success: false,
        message: 'ل��س لديك صلاحية لعرض هذه البيانات'
      });
    }

    // Get data from database (SQLite or Supabase)
    const { loadSettings } = await import('./settings');
    const currentSettings = loadSettings();

    // Use getDashboardStats from databaseService for consistency
    const stats = await database.getDashboardStats(currentSettings);

    const investors = await database.getInvestorsWithEffectiveProfits(currentSettings);
    const expenses = await database.getExpenses();
    const revenues = await database.getRevenues();
    const withdrawals = await database.getWithdrawals();

    // If user is an investor, filter data to show only their information
    let filteredData = {
      stats,
      investors,
      expenses,
      revenues,
      withdrawals,
      recentActivities: [] as any[],
    };

    if (user.role === 'Investor') {
      const userInvestor = investors.find(inv => 
        inv.name.toLowerCase().trim() === user.name.toLowerCase().trim()
      );
      filteredData = {
        stats: {
          ...stats,
          activeInvestors: 1,
        },
        investors: userInvestor ? [userInvestor] : [],
        expenses,
        revenues,
        withdrawals: withdrawals.filter(w => 
          w.investorName.toLowerCase().trim() === user.name.toLowerCase().trim()
        ),
        recentActivities: [],
      };
    }

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل البيانات'
    });
  }
};

export const handleGetInvestors: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewInvestors) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحي�� لعرض بيانات المست��مرين'
      });
    }

    // Check if requesting effective profits calculation
    const includeEffective = req.query.includeEffective === 'true';

    let investorsData;
    if (includeEffective) {
      // Load current settings for accurate calculations
      const { loadSettings } = await import('./settings');
      const currentSettings = loadSettings();

      // Get investors with effective profit calculations
      investorsData = await database.getInvestorsWithEffectiveProfits(currentSettings);
    } else {
      // Get regular investors data
      investorsData = await database.getInvestors();
    }

    res.json({
      success: true,
      data: investorsData
    });

  } catch (error) {
    console.error('Get investors error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات المستثمرين'
    });
  }
};

export const handleGetExpenses: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewExpenses) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض بيانات المصاري��'
      });
    }

    // Get data from database (SQLite or Supabase)
    const expensesData = await database.getExpenses();

    res.json({
      success: true,
      data: expensesData
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات المصاريف'
    });
  }
};

export const handleGetRevenues: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewRevenues) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض بيانا�� الإيرادات'
      });
    }

    // Get data from database (SQLite or Supabase)
    const revenuesData = await database.getRevenues();

    res.json({
      success: true,
      data: revenuesData
    });

  } catch (error) {
    console.error('Get revenues error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات الإيرادات'
    });
  }
};

export const handleGetWithdrawals: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewWithdrawals) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض بيانات السحوبات'
      });
    }

    // Get data from database (SQLite or Supabase)
    const withdrawalsData = await database.getWithdrawals();

    // Filter withdrawals for investors to show only their own
    let filteredWithdrawals = withdrawalsData;
    if (user.role === 'Investor') {
      filteredWithdrawals = withdrawalsData.filter(w => w.investorName === user.name);
    }

    res.json({
      success: true,
      data: filteredWithdrawals
    });

  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات السحوبات'
    });
  }
};



export const handleGetProjectWithdrawals: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض سحوبات المشروع'
      });
    }

    // Get data from database (SQLite or Supabase)
    const projectWithdrawalsData = await database.getProjectWithdrawals();

    res.json({
      success: true,
      data: projectWithdrawalsData
    });

  } catch (error) {
    console.error('Get project withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات سحوبات المشروع'
    });
  }
};

export const handleSyncData: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewSettings) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لمزامنة البيانات'
      });
    }

    // For now, just return success since we're using mock data
    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح'
    });

  } catch (error) {
    console.error('Sync data error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في مزامنة البيانات'
    });
  }
};
