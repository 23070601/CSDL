import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';

interface Activity {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'logout';
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAuditLogs({ limit: 10 });
      
      // Handle response that might be undefined or empty
      const logsData = Array.isArray(response.data) ? response.data : [];
      
      // Transform audit log data to activity format
      const transformedActivities: Activity[] = logsData.map((log: any) => ({
        id: log.id || log.LogID || '',
        user: log.user_id || log.StaffID || 'System',
        action: log.action || log.Action || 'Unknown Action',
        details: log.details || log.Details || '',
        timestamp: log.timestamp || log.Timestamp || new Date().toISOString(),
        type: (log.action?.toLowerCase().includes('create') || log.Action?.toLowerCase().includes('create') ? 'create' :
               log.action?.toLowerCase().includes('update') || log.Action?.toLowerCase().includes('update') ? 'update' :
               log.action?.toLowerCase().includes('delete') || log.Action?.toLowerCase().includes('delete') ? 'delete' : 'login') as any,
      }));
      
      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return 'text-status-success';
      case 'update':
        return 'text-primary-600';
      case 'delete':
        return 'text-status-error';
      case 'login':
        return 'text-primary-600';
      case 'logout':
        return 'text-neutral-600';
      default:
        return 'text-neutral-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-h5 text-neutral-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-neutral-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-h5 text-neutral-900 mb-6">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-p4 text-neutral-600">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-b-0">
              <div className={`text-2xl flex-shrink-0 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-p4 font-semibold text-neutral-900">
                  {activity.action}
                </p>
                {activity.details && (
                  <p className="text-p5 text-neutral-600 mt-1 truncate">
                    {activity.details}
                  </p>
                )}
                <p className="text-p5 text-neutral-500 mt-2">
                  {activity.user} • {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
