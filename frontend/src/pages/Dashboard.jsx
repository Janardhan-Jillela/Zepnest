import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStats, getRequests } from '../api/requests';
import StatusBadge from '../components/StatusBadge';
import { PageLoader } from '../components/Loader';
import { PlusCircle, List, ClipboardList, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  cleaning: '🧹', plumbing: '🔧', electrical: '⚡',
  carpentry: '🪚', painting: '🎨', other: '✨',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, reqRes] = await Promise.all([
          getStats(),
          getRequests({ page: 1, limit: 5 }),
        ]);
        setStats(statsRes.data.data.stats);
        setRecent(reqRes.data.data.requests);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="page-wrapper"><PageLoader /></div>;

  const statCards = [
    { label: 'Total Requests', value: stats?.total ?? 0, icon: ClipboardList, cls: 'stat-card-total', color: '#3b82f6' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, cls: 'stat-card-pending', color: '#f59e0b' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, icon: ArrowRight, cls: 'stat-card-inprogress', color: '#06b6d4' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle2, cls: 'stat-card-completed', color: '#10b981' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Here's what's happening with your service requests.</p>
          </div>
          <Link to="/requests/new" className="btn btn-primary" id="dashboard-new-request-btn">
            <PlusCircle size={16} />
            New Request
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-4" style={{ marginBottom: '40px' }}>
          {statCards.map(({ label, value, icon: Icon, cls, color }) => (
            <div key={label} className={`stat-card ${cls}`}>
              <div className="stat-icon" style={{ background: `${color}22` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>

        {/* Recent requests */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          <div>
            <div className="flex-between mb-4">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Requests</h2>
              <Link to="/requests" className="btn btn-ghost btn-sm" id="view-all-btn">
                <List size={14} />
                View All
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="card card-flat">
                <div className="empty-state" style={{ padding: '48px 16px' }}>
                  <div className="empty-icon">
                    <ClipboardList size={32} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No requests yet</h3>
                  <p style={{ fontSize: '0.875rem' }}>Create your first service request to get started.</p>
                  <Link to="/requests/new" className="btn btn-primary btn-sm" id="empty-new-request-btn">
                    <PlusCircle size={14} />
                    New Request
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recent.map((req) => (
                  <Link key={req.id} to={`/requests/${req.id}`} style={{ textDecoration: 'none' }}>
                    <div className="request-card">
                      <span style={{ fontSize: '28px', flexShrink: 0 }}>
                        {CATEGORY_ICONS[req.category] || '✨'}
                      </span>
                      <div className="request-card-body">
                        <div className="request-card-title">{req.title}</div>
                        <div className="request-card-meta">
                          <span className="category-chip">{req.category}</span>
                          <span className="request-card-meta-item">
                            <Clock size={12} />
                            {new Date(req.preferredTime).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions panel */}
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/requests/new', label: 'Create New Request', icon: PlusCircle, color: '#3b82f6', desc: 'Submit a home service request' },
                { to: '/requests', label: 'View All Requests', icon: List, color: '#8b5cf6', desc: 'Manage your requests' },
                { to: '/requests?status=pending', label: 'Pending Requests', icon: Clock, color: '#f59e0b', desc: `${stats?.pending ?? 0} awaiting action` },
                { to: '/requests?status=in_progress', label: 'In Progress', icon: ArrowRight, color: '#06b6d4', desc: `${stats?.inProgress ?? 0} active` },
              ].map(({ to, label, icon: Icon, color, desc }) => (
                <Link
                  key={label}
                  to={to}
                  style={{ textDecoration: 'none' }}
                  id={`quick-${label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{desc}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
