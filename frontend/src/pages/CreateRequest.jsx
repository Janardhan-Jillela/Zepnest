import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest, uploadImage } from '../api/requests';
import Loader from '../components/Loader';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning', icon: '🧹', cls: 'cat-cleaning' },
  { value: 'plumbing', label: 'Plumbing', icon: '🔧', cls: 'cat-plumbing' },
  { value: 'electrical', label: 'Electrical', icon: '⚡', cls: 'cat-electrical' },
  { value: 'carpentry', label: 'Carpentry', icon: '🪚', cls: 'cat-carpentry' },
  { value: 'painting', label: 'Painting', icon: '🎨', cls: 'cat-painting' },
  { value: 'other', label: 'Other', icon: '✨', cls: 'cat-other' },
];

const STEPS = [
  { label: 'Details', desc: 'What do you need?' },
  { label: 'Location & Time', desc: 'Where and when?' },
  { label: 'Review', desc: 'Confirm & submit' },
];

const defaultForm = {
  title: '', description: '', category: 'cleaning',
  address: '', preferredTime: '',
};

export default function CreateRequest() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.title.trim()) errs.title = 'Title is required.';
      else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters.';
      if (!form.description.trim()) errs.description = 'Description is required.';
      if (!form.category) errs.category = 'Category is required.';
    }
    if (s === 1) {
      if (!form.address.trim()) errs.address = 'Address is required.';
      if (!form.preferredTime) errs.preferredTime = 'Preferred time is required.';
      else if (new Date(form.preferredTime) < new Date()) errs.preferredTime = 'Preferred time must be in the future.';
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await createRequest({
        ...form,
        preferredTime: new Date(form.preferredTime).toISOString(),
      });
      const newId = res.data.data.request.id;

      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append('image', imageFile);
          await uploadImage(newId, fd);
        } catch {
          toast.error('Request created but image upload failed.');
        }
      }

      toast.success('Service request created! 🎉');
      navigate(`/requests/${newId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create request.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  const selectedCat = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="page-wrapper animate-fade">
      <div className="container" style={{ padding: '44px 24px', maxWidth: 780 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} id="back-btn">
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Create Service Request</h1>
            <p className="page-subtitle">Tell us what you need and we'll get it sorted.</p>
          </div>
        </div>

        {/* ── Step Progress Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '44px' }}>
          {STEPS.map(({ label }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: i < step
                      ? 'var(--color-success)'
                      : i === step
                        ? 'var(--color-primary)'
                        : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${i < step
                      ? 'var(--color-success)'
                      : i === step
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i <= step ? 'white' : 'var(--color-text-dim)',
                    fontWeight: 800, fontSize: '0.875rem',
                    boxShadow: i === step ? '0 0 16px rgba(16,185,129,0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                  color: i === step
                    ? 'var(--color-primary-light)'
                    : i < step
                      ? 'var(--color-success)'
                      : 'var(--color-text-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 10px', marginBottom: '22px',
                  background: i < step
                    ? 'linear-gradient(90deg, var(--color-success), var(--color-primary))'
                    : 'var(--color-border)',
                  borderRadius: '2px',
                  transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Main Card ── */}
        <div className="card" style={{ padding: '36px' }}>

          {/* STEP 0: Details */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.01em' }}>
                  Request Details
                </h2>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
                  Describe what you need help with.
                </p>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="title-input">Request Title *</label>
                <input
                  id="title-input"
                  name="title"
                  type="text"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g. Deep clean of 2BHK apartment"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                />
                {errors.title && <span className="form-error">⚠ {errors.title}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {CATEGORIES.map(({ value, label, icon, cls }) => (
                    <button
                      key={value}
                      type="button"
                      id={`category-${value}`}
                      onClick={() => { setForm((f) => ({ ...f, category: value })); setErrors((e) => ({ ...e, category: '' })); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '13px 16px',
                        background: form.category === value ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${form.category === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: form.category === value ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                        fontWeight: 700, fontSize: '0.875rem',
                        cursor: 'pointer', transition: 'all 0.18s ease',
                        boxShadow: form.category === value ? '0 0 12px rgba(16,185,129,0.15)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
                {errors.category && <span className="form-error">⚠ {errors.category}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description-input">Description *</label>
                <textarea
                  id="description-input"
                  name="description"
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe what you need in detail — the more info, the better!"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
                {errors.description && <span className="form-error">⚠ {errors.description}</span>}
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label className="form-label">Reference Photo <span style={{ fontWeight: 400, color: 'var(--color-text-dim)' }}>(optional)</span></label>
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%', maxHeight: 200, objectFit: 'cover',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      id="remove-image-btn"
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: 30, height: 30,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-input"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                      padding: '32px',
                      border: '2px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: 'var(--color-text-dim)',
                      background: 'rgba(16,185,129,0.02)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(16,185,129,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(16,185,129,0.02)'; }}
                  >
                    <Upload size={26} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to upload image</span>
                    <span style={{ fontSize: '0.75rem' }}>JPEG, PNG, WebP — max 5MB</span>
                    <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Location & Time */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.01em' }}>
                  Location & Schedule
                </h2>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
                  Where and when should the service be done?
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address-input">Service Address *</label>
                <textarea
                  id="address-input"
                  name="address"
                  className={`form-textarea ${errors.address ? 'error' : ''}`}
                  placeholder="Full address where the service should be performed"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                />
                {errors.address && <span className="form-error">⚠ {errors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="time-input">Preferred Date & Time *</label>
                <input
                  id="time-input"
                  name="preferredTime"
                  type="datetime-local"
                  className={`form-input ${errors.preferredTime ? 'error' : ''}`}
                  value={form.preferredTime}
                  onChange={handleChange}
                  min={minDateTime}
                  style={{ colorScheme: 'dark' }}
                />
                {errors.preferredTime && <span className="form-error">⚠ {errors.preferredTime}</span>}
                <span className="form-hint">We'll confirm availability and contact you within 2 hours.</span>
              </div>
            </div>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.01em' }}>
                  Review & Submit
                </h2>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
                  Please review your request before submitting.
                </p>
              </div>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Reference"
                  style={{
                    width: '100%', maxHeight: 180, objectFit: 'cover',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                  }}
                />
              )}

              {/* Summary fields */}
              <div className="card card-flat" style={{ padding: '0' }}>
                {[
                  { label: 'Title', value: form.title },
                  {
                    label: 'Category',
                    value: (
                      <span className={`category-chip ${selectedCat?.cls || ''}`}>
                        {selectedCat?.icon} {form.category}
                      </span>
                    ),
                  },
                  { label: 'Description', value: form.description },
                  { label: 'Address', value: form.address },
                  {
                    label: 'Preferred Time',
                    value: new Date(form.preferredTime).toLocaleString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long',
                      day: 'numeric', hour: '2-digit', minute: '2-digit',
                    }),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="detail-field" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div className="detail-field-label">{label}</div>
                    <div className="detail-field-value">{value}</div>
                  </div>
                ))}
              </div>

              {/* Confirmation notice */}
              <div
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  fontSize: '0.875rem',
                  color: 'var(--color-primary-light)',
                  display: 'flex', gap: '10px', alignItems: 'center',
                }}
              >
                <Sparkles size={16} />
                Your request will be created with status <strong style={{ color: 'var(--color-primary-light)' }}>Pending</strong>.
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '36px', paddingTop: '24px',
            borderTop: '1px solid var(--color-border)',
          }}>
            <button
              className="btn btn-secondary"
              onClick={step === 0 ? () => navigate(-1) : prevStep}
              id="prev-btn"
            >
              <ArrowLeft size={14} />
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={nextStep} id="next-btn">
                Next: {STEPS[step + 1].label}
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                id="submit-request-btn"
                style={{ minWidth: 170 }}
              >
                {loading ? <Loader size="sm" /> : <CheckCircle2 size={14} />}
                Submit Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
