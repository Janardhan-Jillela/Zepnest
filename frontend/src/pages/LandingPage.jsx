import { Link } from 'react-router-dom';
import { Shield, Clock, Star, Zap, CheckCircle, ArrowRight, Home, Wrench, Paintbrush, Droplets, Sparkles } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Secure & Verified', desc: 'All service providers are background-checked and verified for your safety.', color: '#10b981' },
  { icon: Clock, title: 'Track in Real-Time', desc: 'Follow your request from Pending → In Progress → Completed, live.', color: '#f59e0b' },
  { icon: Star, title: 'Quality Assured', desc: 'Rate and review every service. We only keep the best providers.', color: '#a78bfa' },
  { icon: Zap, title: 'Instant Booking', desc: 'Submit a service request in under 2 minutes. We handle the rest.', color: '#34d399' },
  { icon: Home, title: 'All Home Services', desc: 'Cleaning, plumbing, electrical, carpentry, painting — all in one place.', color: '#fb923c' },
  { icon: CheckCircle, title: 'No Hidden Fees', desc: 'Transparent pricing. What you see is exactly what you pay.', color: '#60a5fa' },
];

const categories = [
  { label: 'Cleaning', icon: '🧹', cls: 'cat-cleaning' },
  { label: 'Plumbing', icon: '🔧', cls: 'cat-plumbing' },
  { label: 'Electrical', icon: '⚡', cls: 'cat-electrical' },
  { label: 'Carpentry', icon: '🪚', cls: 'cat-carpentry' },
  { label: 'Painting', icon: '🎨', cls: 'cat-painting' },
  { label: 'More', icon: '✨', cls: 'cat-other' },
];

const liveRequests = [
  { title: 'Deep Cleaning', status: 'In Progress', color: '#93c5fd', icon: '🧹', time: 'Today, 3:00 PM' },
  { title: 'Pipe Repair', status: 'Pending', color: '#fbbf24', icon: '🔧', time: 'Tomorrow, 10 AM' },
  { title: 'Wall Painting', status: 'Completed', color: '#34d399', icon: '🎨', time: 'Yesterday' },
];

export default function LandingPage() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content animate-slide-up">
            <div className="hero-badge">
              <Sparkles size={13} />
              Home Care, Reimagined
            </div>

            <h1 className="hero-title">
              Your Home,{' '}
              <span className="hero-title-gradient">Perfectly Cared For</span>
            </h1>

            <p className="hero-subtitle">
              Zepnest connects you with verified home-care professionals. Submit a request,
              track progress in real-time, and get your home sorted — effortlessly.
            </p>

            <div className="hero-actions">
              <Link to="/auth" className="btn btn-primary btn-lg" id="hero-cta-btn">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link to="/auth" className="btn btn-secondary btn-lg" id="hero-login-btn">
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '28px', flexWrap: 'wrap' }}>
              {['No credit card required', 'Setup in 2 minutes', 'Cancel anytime'].map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle size={14} style={{ color: 'var(--color-primary)' }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Floating Live Dashboard Card ── */}
          <div
            className="hero-visual animate-float"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'absolute',
              right: '4%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '360px',
              opacity: 1,
              pointerEvents: 'none',
            }}
          >
            {/* Main card */}
            <div
              style={{
                background: 'rgba(12, 20, 15, 0.92)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '24px',
                padding: '26px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                    MY REQUESTS
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    3 active services
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(52,211,153,0.2)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-light)',
                  }}
                >
                  View all →
                </div>
              </div>

              {/* Requests list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {liveRequests.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: i < 2 ? '1px solid rgba(52,211,153,0.08)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)' }}>{item.time}</div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: item.color,
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}35`,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom mini stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Completed', value: '12', color: '#34d399' },
                { label: 'Pending', value: '3', color: '#fbbf24' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'rgba(12,20,15,0.9)',
                    border: '1px solid rgba(52,211,153,0.15)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', marginBottom: '4px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: '80px 0 48px', borderTop: '1px solid rgba(52,211,153,0.08)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}
            >
              <span style={{ width: 24, height: 1, background: 'var(--color-border-light)', display: 'inline-block' }} />
              Services We Cover
              <span style={{ width: 24, height: 1, background: 'var(--color-border-light)', display: 'inline-block' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
            {categories.map((cat) => (
              <Link
                to="/auth"
                key={cat.label}
                className={`category-chip ${cat.cls}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '24px 12px',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ fontSize: '30px' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="container">
          <h2 className="features-title">
            Everything you need,{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              nothing you don't
            </span>
          </h2>
          <p className="features-subtitle">
            Built for homeowners who want reliability, transparency, and peace of mind.
          </p>
          <div className="grid grid-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon" style={{ color, background: `${color}18`, borderColor: `${color}25` }}>
                  <Icon size={22} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: '72px 48px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(52,211,153,0.12)' }} />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--color-primary-light)',
                marginBottom: '24px',
              }}
            >
              <Sparkles size={12} />
              Join 10,000+ happy homeowners
            </div>

            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', marginBottom: '36px', maxWidth: '520px', margin: '0 auto 36px' }}>
              Join thousands of homeowners who trust Zepnest for reliable home care.
            </p>
            <Link to="/auth" className="btn btn-amber btn-lg" id="cta-bottom-btn">
              Create Your Free Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid rgba(52,211,153,0.08)',
          padding: '36px 0',
          color: 'var(--color-text-dim)',
          fontSize: '0.875rem',
        }}
      >
        <div className="container flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="flex gap-3" style={{ alignItems: 'center' }}>
            <div className="navbar-logo" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>Z</div>
            <span>© 2025 Zepnest. Home Care, At a Tap.</span>
          </div>
          <span>Built with ❤️ for the Zepnest Engineering Team</span>
        </div>
      </footer>
    </div>
  );
}
