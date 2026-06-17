import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRequests, deleteRequest, updateStatus } from '../api/requests';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Loader';
import Loader from '../components/Loader';
import {
  PlusCircle, Search, Filter, Trash2, Eye, Clock,
  MapPin, ChevronLeft, ChevronRight, ClipboardList, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  cleaning: '🧹', plumbing: '🔧', electrical: '⚡',
  carpentry: '🪚', painting: '🎨', other: '✨',
};

const CATEGORIES = ['cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'other'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function MyRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await getRequests(params);
      setRequests(res.data.data.requests);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRequest(deleteModal.id);
      toast.success('Request deleted.');
      setDeleteModal({ open: false, id: null, title: '' });
      load();
    } catch {
      toast.error('Failed to delete request.');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || categoryFilter;

  return (
    <div className="page-wrapper animate-fade">
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Requests</h1>
            <p className="page-subtitle">
              {pagination ? `${pagination.total} total request${pagination.total !== 1 ? 's' : ''}` : 'Manage all your service requests'}
            </p>
          </div>
          <Link to="/requests/new" className="btn btn-primary" id="new-request-btn">
            <PlusCircle size={16} />
            New Request
          </Link>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
            {/* Search */}
            <div className="search-bar">
              <Search size={16} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
              <input
                id="search-input"
                type="text"
                placeholder="Search by title, description, or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSearch('')}
                  style={{ padding: '4px', flexShrink: 0 }}
                >×</button>
              )}
            </div>

            {/* Status filter */}
            <select
              id="status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>

            {/* Category filter */}
            <select
              id="category-filter"
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            {/* Refresh */}
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-btn" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex gap-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                <Filter size={12} style={{ display: 'inline', marginRight: 4 }} />
                Active filters:
              </span>
              {search && <span className="category-chip">Search: "{search}"</span>}
              {statusFilter && <span className="category-chip">{statusFilter.replace('_', ' ')}</span>}
              {categoryFilter && <span className="category-chip">{categoryFilter}</span>}
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn"
                style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Request list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Loader size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card card-flat">
            <div className="empty-state">
              <div className="empty-icon"><ClipboardList size={36} /></div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                {hasFilters ? 'No requests match your filters' : 'No service requests yet'}
              </h3>
              <p>{hasFilters ? 'Try adjusting your search or filters.' : 'Create your first service request to get started.'}</p>
              {hasFilters ? (
                <button className="btn btn-secondary btn-sm" onClick={clearFilters} id="empty-clear-btn">Clear Filters</button>
              ) : (
                <Link to="/requests/new" className="btn btn-primary btn-sm" id="empty-create-btn">
                  <PlusCircle size={14} /> Create Request
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map((req) => (
              <div key={req.id} className="request-card">
                <span style={{ fontSize: '32px', flexShrink: 0 }}>
                  {CATEGORY_ICONS[req.category] || '✨'}
                </span>
                <div className="request-card-body">
                  <div className="request-card-title">{req.title}</div>
                  <div className="request-card-meta">
                    <span className="category-chip">{req.category}</span>
                    <span className="request-card-meta-item">
                      <Clock size={12} />
                      {new Date(req.preferredTime).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="request-card-meta-item">
                      <MapPin size={12} />
                      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.address}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                      #{req.id}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <StatusBadge status={req.status} />
                  <Link
                    to={`/requests/${req.id}`}
                    className="btn btn-secondary btn-sm"
                    id={`view-request-${req.id}`}
                    title="View details"
                  >
                    <Eye size={14} />
                  </Link>
                  {!['completed', 'cancelled'].includes(req.status) && (
                    <button
                      className="btn btn-danger btn-sm"
                      id={`delete-request-${req.id}`}
                      title="Delete"
                      onClick={() => setDeleteModal({ open: true, id: req.id, title: req.title })}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
              id="prev-page-btn"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} style={{ color: 'var(--color-text-dim)', padding: '0 4px' }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                    id={`page-btn-${p}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="page-btn"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              id="next-page-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, title: '' })}
        title="Delete Request"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModal({ open: false, id: null, title: '' })} id="cancel-delete-btn">
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} id="confirm-delete-btn">
              {deleting ? <Loader size="sm" /> : <Trash2 size={14} />}
              Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--color-text)' }}>"{deleteModal.title}"</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
