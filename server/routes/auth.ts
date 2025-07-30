import { RequestHandler } from "express";
import { LoginCredentials, AuthResponse } from "../../shared/types";
import { AuthService } from "../services/auth";
import jwt from 'jsonwebtoken';

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    console.log('🔐 Login request received');
    console.log('📝 Request method:', req.method);
    console.log('📍 Request URL:', req.url);
    console.log('🔤 Content-Type:', req.headers['content-type']);
    console.log('📦 Body available:', !!req.body);
    console.log('📊 Body content:', req.body);

    // Safely extract credentials
    let credentials: LoginCredentials;
    try {
      credentials = req.body;
      if (!credentials) {
        throw new Error('No body received');
      }
    } catch (error) {
      console.error('❌ Error reading request body:', error);
      return res.status(400).json({
        success: false,
        message: 'خطأ في قرا��ة بيانات الطلب'
      });
    }

    if (!credentials || !credentials.identifier || !credentials.password) {
      console.log('❌ Missing credentials:', credentials);
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال اسم المستخدم وكلمة المرور'
      });
    }

    // Find user in database
    const { databaseService } = await import('../services/databaseService');
    const users = await databaseService.getUsers();

    const user = users.find(u =>
      u.phone === credentials.identifier ||
      u.name === credentials.identifier
    );

    if (!user) {
      console.log('❌ User not found:', credentials.identifier);
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Simple password check
    if (user.password !== credentials.password) {
      console.log('❌ Incorrect password for user:', user.name);
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة'
      });
    }

    console.log('✅ User authenticated:', user.name, 'Role:', user.role);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'investment-app-secret-key-2024';
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        name: user.name
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Log the login operation
    try {
      await dbService.addOperationLog({
        id: 'LOG' + Date.now(),
        operationType: 'تسجيل دخول',
        details: `تم تسجيل دخول المستخدم: ${user.name} بدور ${user.role} من عنوان IP: ${req.ip || 'غير معروف'}`,
        date: new Date().toLocaleString('ar-SA'),
        performedBy: user.name
      });
    } catch (logError) {
      console.error('Error logging login operation:', logError);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error('❌ Login error:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        message: 'خطأ في تنسيق البيانات المرسلة'
      });
    }

    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const handleLogout: RequestHandler = async (req, res) => {
  try {
    // Get user info from request body or token
    const userName = req.body?.userName || 'مستخدم غير معروف';
    const userRole = req.body?.userRole || 'غير محدد';

    // Log the logout operation
    try {
      const { databaseService } = await import('../services/databaseService');

      await databaseService.addOperationLog({
        id: 'LOG' + Date.now(),
        operationType: 'تسجيل خروج',
        details: `تم تسجيل خروج المستخدم: ${userName} بدور ${userRole}`,
        date: new Date().toLocaleString('ar-SA'),
        performedBy: userName
      });
    } catch (logError) {
      console.error('Error logging logout operation:', logError);
    }

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل الخروج'
    });
  }
};

const getUserPermissions = (role: string) => {
  switch (role) {
    case 'Admin':
      return {
        canViewInvestors: true,
        canEditInvestors: true,
        canViewExpenses: true,
        canEditExpenses: true,
        canViewRevenues: true,
        canEditRevenues: true,
        canViewWithdrawals: true,
        canApproveWithdrawals: true,
        canViewSettings: true,
        canEditSettings: true,
        canViewAIInsights: true,
        canViewAllData: true,
        canExportData: true,
      };

    case 'Assistant':
      return {
        canViewInvestors: true,
        canEditInvestors: false,
        canViewExpenses: true,
        canEditExpenses: true,
        canViewRevenues: true,
        canEditRevenues: true,
        canViewWithdrawals: true,
        canApproveWithdrawals: true,
        canViewSettings: false,
        canEditSettings: false,
        canViewAIInsights: true,
        canViewAllData: false,
        canExportData: false,
      };

    case 'Investor':
      return {
        canViewInvestors: false,
        canEditInvestors: false,
        canViewExpenses: true,
        canEditExpenses: false,
        canViewRevenues: true,
        canEditRevenues: false,
        canViewWithdrawals: true,
        canApproveWithdrawals: false,
        canViewSettings: false,
        canEditSettings: false,
        canViewAIInsights: true,
        canViewAllData: false,
        canExportData: false,
        canViewOwnProfile: true,
        canViewOwnWithdrawals: true,
      };

    default:
      return {
        canViewInvestors: false,
        canEditInvestors: false,
        canViewExpenses: false,
        canEditExpenses: false,
        canViewRevenues: false,
        canEditRevenues: false,
        canViewWithdrawals: false,
        canApproveWithdrawals: false,
        canViewSettings: false,
        canEditSettings: false,
        canViewAIInsights: false,
        canViewAllData: false,
        canExportData: false,
      };
  }
};

export const handleVerifyToken: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة مطلوب'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'investment-app-secret-key-2024';
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded) {
      const permissions = getUserPermissions((decoded as any).role);
      res.json({
        success: true,
        user: decoded,
        permissions
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح'
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح'
    });
  }
};

// Middleware to check authentication
export const authenticateRequest: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة مطلوب'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'investment-app-secret-key-2024';
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded) {
      // Add user info to request
      (req as any).user = decoded;
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح'
    });
  }
};

export { getUserPermissions };
