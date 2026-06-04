import api from './api';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  sku: string;
  productName: string;
  userEmail: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const res = await api.get('/audit-logs');
    return res.data || [];
  } catch (e) {
    console.error('Failed to fetch audit logs:', e);
    return [];
  }
};

export const addAuditLog = async (
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  sku: string,
  productName: string,
  userEmail: string
): Promise<void> => {
  try {
    const newLog = {
      action,
      sku,
      productName,
      userEmail,
    };
    await api.post('/audit-logs', newLog);
    window.dispatchEvent(new Event('audit-log-updated'));
  } catch (e) {
    console.error('Failed to save audit log:', e);
  }
};

export const clearAuditLogs = async (): Promise<void> => {
  try {
    await api.delete('/audit-logs');
    window.dispatchEvent(new Event('audit-log-updated'));
  } catch (e) {
    console.error('Failed to purge audit logs:', e);
  }
};
