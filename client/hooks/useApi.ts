import { useState, useEffect } from 'react';
import { ApiResponse } from '../../shared/types';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        let errorMessage = `خطأ في الخادم: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the status-based message
        }
        setError(errorMessage);
        return;
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.message || 'حدث خطأ غير متوقع');
      }
    } catch (err) {
      const errorMessage = err instanceof TypeError && err.message.includes('fetch')
        ? 'فشل في الاتصال - تحقق من الاتصال بالإنترنت'
        : 'حدث خطأ في الاتصال بالخادم';
      setError(errorMessage);
      console.error('API Error for endpoint', endpoint, ':', err);
    } finally {
      setLoading(false);
    }
  };

  const postData = async (payload: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      // Check if response is ok before reading body
      if (!response.ok) {
        let errorMessage = 'حدث خطأ غير متوقع';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `خطأ في الخادم: ${response.status}`;
        }
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      let result: ApiResponse<T>;
      try {
        result = await response.json();
      } catch (jsonError) {
        const errorMessage = 'خطأ في تحليل استجابة الخادم';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      if (result.success) {
        setData(result.data || null);
        return result;
      } else {
        setError(result.message || 'حدث خطأ غير متوقع');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof TypeError && err.message.includes('fetch')
        ? 'فشل في الاتصال - تحقق من الاتصال بالإنترنت'
        : 'حدث خطأ في الاتصال بالخادم';
      setError(errorMessage);
      console.error('API Error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [endpoint, options.immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    postData,
  };
}

export function useApiMutation<T>(endpoint: string, options?: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (payload: any, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: method !== 'GET' ? JSON.stringify(payload) : undefined,
      });

      // Check if response is ok before reading body
      if (!response.ok) {
        // Try to get error message from response if possible
        let errorMessage = 'حدث خطأ غير متوقع';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `خطأ في الخادم: ${response.status}`;
        }
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      let result: ApiResponse<T>;

      try {
        result = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, return a generic error
        const errorMessage = 'خطأ في تحليل استجابة الخادم';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      if (!result.success) {
        setError(result.message || 'حدث خطأ غير متوقع');
      } else {
        // Call success callback if provided
        if (options?.onSuccess) {
          options.onSuccess();
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof TypeError && err.message.includes('fetch')
        ? 'فشل في الاتصال - تحقق من الاتصال بالإنترنت'
        : 'حدث خطأ في الاتصال بالخادم';
      setError(errorMessage);
      console.error('API Error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}

// Specialized hooks for common operations
export function useDashboard() {
  return useApi('/dashboard');
}

export function useInvestors() {
  return useApi('/investors');
}

export function useExpenses() {
  return useApi('/expenses');
}

export function useRevenues() {
  return useApi('/revenues');
}

export function useWithdrawals() {
  return useApi('/withdrawals');
}
