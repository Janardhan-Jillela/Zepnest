import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRequest, updateStatus, deleteRequest, uploadImage } from '../api/requests';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Loader';
import Loader from '../components/Loader';
import {
  ArrowLeft, Trash2, Edit3, Upload, Clock, MapPin,
  Tag, Calendar, CheckCircle2, X, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  cleaning: '🧹', plumbing: '🔧', electrical: '⚡',
  carpentry: '🪚', painting: '🎨', other: '✨',
};

const STATUS_FLOW = ['pending', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

const TRANSITIONS = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_COLORS = {
  pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981', cancelled: '#ef4444',
};

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await getRequest(id);
      setRequest(res.data.data.request);
    } catch {
      toast.error('Request not found.');
      navigate('/requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(newStatus);
    try {
      await updateStatus(id, newStatus);
      toast.success(`Status updated to "${STATUS_LABELS[newStatus]}"`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading('');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRequest(id);
      toast.success('Request deleted.');
      navigate('/requests');
    } catch {
      toast.error('Failed to delete request.');
      setDeleting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await uploadImage(id, fd);
      toast.success('Image uploaded!');
      load();
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="page-wrapper"><PageLoader /></div>;
  if (!request) return null;

  const allowed = TRANSITIONS[request.status] || [];
  const stepIndex = STATUS_FLOW.indexOf(request.status);
  const isFinal = ['completed', 'cancelled'].includes(request.status);

  return (
    <div className="page-wrapper animate-fade">
      <div className="container" style={{ padding: '40px 24px', maxWidth: 900 }}>
        {/* Back nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')} id="back-to-requests-btn">
            <ArrowLeft size={15} />
            My Requests
          </button>
          <span style={{ color: 'var(--color-border)', fontSize: '0.875rem' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            #{request.id} — {request.title}
          </span>
        </div>

        {/* Header */}
        <div className="detail-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '32px' }}>{CATEGORY_ICONS[request.category] || '✨'}</span>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {request.title}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <StatusBadge status={request.status} />
              <span className="category-chip">{request.category}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-dim)' }}>
                Request #{request.id}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            {!isFinal && (
              <Link to={`/requests/${id}/edit`} className="btn btn-secondary btn-sm" id="edit-btn">
                <Edit3 size={14} />
                Edit
              </Link>
            )}
            <label
              htmlFor="detail-image-upload"
              className="btn btn-secondary btn-sm"
              style={{ cursor: 'pointer' }}
              title="Upload image"
              id="upload-image-label"
            >
              {uploading ? <Loader size="sm" /> : <Upload size={14} />}
              {uploading ? 'Uploading…' : 'Photo'}
              <input id="detail-image-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            {!isFinal && (
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(true)} id="delete-btn">
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* Image */}
            {request.imageUrl && (
              <img
                src={`${API_BASE}${request.imageUrl}`}
                alt="Request reference"
                className="detail-image"
              />
            )}

            {/* Details card */}
            <div className="card card-flat">
              <div className="detail-field">
                <div className="detail-field-label">
                  <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Description
                </div>
                <div className="detail-field-value">{request.description}</div>
              </div>

              <div className="detail-field">
                <div className="detail-field-label">
                  <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Service Address
                </div>
                <div className="detail-field-value">{request.address}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                <div className="detail-field" style={{ paddingRight: '20px' }}>
                  <div className="detail-field-label">
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Preferred Time
                  </div>
                  <div className="detail-field-value">
                    {new Date(request.preferredTime).toLocaleString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long',
                      day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="detail-field" style={{ paddingLeft: '20px', borderLeft: '1px solid var(--color-border)' }}>
                  <div className="detail-field-label">
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Created On
                  </div>
                  <div className="detail-field-value">
                    {new Date(request.createdAt).toLocaleString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Status management */}
          <div>
            <div className="card card-flat">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Status Management
              </h3>

              {/* Progress stepper */}
              <div style={{ marginBottom: '24px' }}>
                {['pending', 'in_progress', 'completed'].map((s, i) => {
                  const isActive = request.status === s;
                  const isDone = stepIndex > i && request.status !== 'cancelled';
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: i < 2 ? '16px' : 0, position: 'relative' }}>
                      {i < 2 && (
                        <div style={{
                          position: 'absolute', left: 15, top: 32, bottom: 0, width: 2,
                          background: isDone ? 'var(--color-success)' : 'var(--color-border)',
                        }} />
                      )}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                        background: isActive ? STATUS_COLORS[s] : isDone ? 'var(--color-success)' : 'var(--color-bg-2)',
                        border: `2px solid ${isActive ? STATUS_COLORS[s] : isDone ? 'var(--color-success)' : 'var(--color-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isActive || isDone ? 'white' : 'var(--color-text-dim)',
                        fontSize: '0.75rem', fontWeight: 700,
                        boxShadow: isActive ? `0 0 12px ${STATUS_COLORS[s]}66` : 'none',
                      }}>
                        {isDone ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <div style={{ paddingTop: '4px' }}>
                        <div style={{
                          fontSize: '0.875rem', fontWeight: 600,
                          color: isActive ? STATUS_COLORS[s] : isDone ? 'var(--color-success)' : 'var(--color-text-dim)',
                        }}>
                          {STATUS_LABELS[s]}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                            Current status
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {request.status === 'cancelled' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px',
                    padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)',
                  }}>
                    <X size={14} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 600 }}>Cancelled</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {allowed.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                    Move to:
                  </div>
                  {allowed.map((s) => (
                    <button
                      key={s}
                      className="btn btn-secondary"
                      onClick={() => handleStatusChange(s)}
                      disabled={!!statusLoading}
                      id={`status-${s}-btn`}
                      style={{
                        justifyContent: 'flex-start',
                        borderColor: STATUS_COLORS[s] + '44',
                        color: STATUS_COLORS[s],
                      }}
                    >
                      {statusLoading === s ? <Loader size="sm" /> : (
                        <span style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: STATUS_COLORS[s], flexShrink: 0,
                        }} />
                      )}
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}

              {isFinal && (
                <div style={{
                  padding: '12px 14px', background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem', color: 'var(--color-text-muted)',
                  display: 'flex', gap: '8px', alignItems: 'center',
                }}>
                  <AlertTriangle size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  This request is {request.status} and cannot be changed.
                </div>
              )}
            </div>

            {/* Last updated */}
            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
              Last updated {new Date(request.updatedAt).toLocaleString('en-IN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Request"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModal(false)} id="cancel-delete-detail-btn">Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} id="confirm-delete-detail-btn">
              {deleting ? <Loader size="sm" /> : <Trash2 size={14} />}
              Delete Permanently
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--color-text)' }}>"{request.title}"</strong>?
          Any uploaded image will also be removed. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
