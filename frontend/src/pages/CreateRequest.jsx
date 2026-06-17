import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest, uploadImage } from '../api/requests';
import Loader from '../components/Loader';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'carpentry', label: 'Carpentry', icon: '🪚' },
  { value: 'painting', label: 'Painting', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '✨' },
];

const STEPS = ['Details', 'Location & Time', 'Review'];

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

  // Min datetime for the input (now + 1 hour)
  const minDateTime = new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  return (
    <div className="page-wrapper animate-fade">
      <div className="container" style={{ padding: '40px 24px', maxWidth: 760 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} id="back-btn">
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Create Service Request</h1>
            <p className="page-subtitle">Tell us what you need and we'll get it sorted.</p>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: 0 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i < step ? 'var(--color-success)' : i === step ? 'var(--color-primary)' : 'var(--color-bg-2)',
                    border: `2px solid ${i < step ? 'var(--color-success)' : i === step ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i <= step ? 'white' : 'var(--color-text-dim)',
                    fontWeight: 700, fontSize: '0.875rem',
                    boxShadow: i === step ? '0 0 12px rgba(59,130,246,0.5)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                  color: i === step ? 'var(--color-primary)' : i < step ? 'var(--color-success)' : 'var(--color-text-dim)',
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 8px', marginBottom: '22px',
                  background: i < step ? 'var(--color-success)' : 'var(--color-border)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card card-flat" style={{ padding: '36px' }}>

          {/* STEP 0: Details */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>Request Details</h2>

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

              <div className="form-group">
                <label className="form-label">Category *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {CATEGORIES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      id={`category-${value}`}
                      onClick={() => { setForm((f) => ({ ...f, category: value })); setErrors((e) => ({ ...e, category: '' })); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 14px',
                        background: form.category === value ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-2)',
                        border: `2px solid ${form.category === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: form.category === value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
                {errors.category && <span className="form-error">⚠ {errors.category}</span>}
              </div>

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
                <label className="form-label">Reference Photo (optional)</label>
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      id="remove-image-btn"
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(0,0,0,0.7)', border: 'none',
                        borderRadius: '50%', width: 28, height: 28,
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
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '28px', border: '2px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      transition: 'border-color 0.2s ease',
                      color: 'var(--color-text-dim)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <Upload size={24} />
                    <span style={{ fontSize: '0.875rem' }}>Click to upload image</span>
                    <span style={{ fontSize: '0.75rem' }}>JPEG, PNG, WebP — max 5MB</span>
                    <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Location & Time */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>Location &amp; Schedule</h2>

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
                <label className="form-label" htmlFor="time-input">Preferred Date &amp; Time *</label>
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
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                  We'll confirm availability and contact you within 2 hours.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>Review &amp; Submit</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Please review your request before submitting.
              </p>

              {imagePreview && (
                <img src={imagePreview} alt="Reference" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
              )}

              {[
                { label: 'Title', value: form.title },
                { label: 'Category', value: `${CATEGORIES.find(c => c.value === form.category)?.icon} ${form.category}` },
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
                <div key={label} className="detail-field">
                  <div className="detail-field-label">{label}</div>
                  <div className="detail-field-value" style={{ textTransform: label === 'Category' ? 'capitalize' : 'none' }}>
                    {value}
                  </div>
                </div>
              ))}

              <div
                style={{
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 'var(--radius-md)', padding: '14px 16px',
                  fontSize: '0.875rem', color: '#34d399', display: 'flex', gap: '10px', alignItems: 'center',
                }}
              >
                <CheckCircle2 size={16} />
                Your request will be created with status <strong>Pending</strong>.
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
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
                Next: {STEPS[step + 1]}
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                id="submit-request-btn"
                style={{ minWidth: 160 }}
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
