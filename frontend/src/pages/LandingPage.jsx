import { Link } from 'react-router-dom';
import { Shield, Clock, Star, Zap, CheckCircle, ArrowRight, Home, Wrench, Paintbrush, Droplets } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Secure & Verified', desc: 'All service providers are background-checked and verified for your safety.' },
  { icon: Clock, title: 'Track in Real-Time', desc: 'Follow your request from Pending → In Progress → Completed, live.' },
  { icon: Star, title: 'Quality Assured', desc: 'Rate and review every service. We only keep the best providers.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Submit a service request in under 2 minutes. We handle the rest.' },
  { icon: Home, title: 'All Home Services', desc: 'Cleaning, plumbing, electrical, carpentry, painting — all in one place.' },
  { icon: CheckCircle, title: 'No Hidden Fees', desc: 'Transparent pricing. What you see is exactly what you pay.' },
];

const categories = [
  { label: 'Cleaning', icon: '🧹', color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  { label: 'Plumbing', icon: '🔧', color: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' },
  { label: 'Electrical', icon: '⚡', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  { label: 'Carpentry', icon: '🪚', color: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
  { label: 'Painting', icon: '🎨', color: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)' },
  { label: 'More', icon: '✨', color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content animate-slide-up">
            <div className="hero-badge">
              <Zap size={13} />
              Home Care, At a Tap
            </div>
            <h1 className="hero-title">
              Home Services,{' '}
              <span className="hero-title-gradient">Simplified &amp; Trusted</span>
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

            {/* Trust bar */}
            <div className="flex gap-4 mt-6" style={{ flexWrap: 'wrap' }}>
              {['No credit card required', 'Setup in 2 minutes', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex gap-2" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', alignItems: 'center' }}>
                  <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Floating visual cards */}
          <div
            className="hero-visual"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'absolute',
              right: '5%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '380px',
              opacity: 1,
              pointerEvents: 'none',
            }}
          >
            {[
              { title: 'Deep Home Cleaning', status: 'in_progress', statusColor: '#60a5fa', cat: 'Cleaning', time: 'Today, 3:00 PM' },
              { title: 'Kitchen Pipe Repair', status: 'pending', statusColor: '#fbbf24', cat: 'Plumbing', time: 'Tomorrow, 10:00 AM' },
              { title: 'Living Room Paint', status: 'completed', statusColor: '#34d399', cat: 'Painting', time: 'Yesterday' },
            ].map((item, i) => (
              <div
                key={i}
                className="card card-flat"
                style={{
                  padding: '14px 18px',
                  transform: `translateX(${i % 2 === 0 ? 0 : 20}px)`,
                  opacity: 1 - i * 0.1,
                  display: 'none',
                }}
              />
            ))}

            {/* Main visual card */}
            <div
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>MY REQUESTS</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>View all →</span>
              </div>
              {[
                { title: 'Deep Cleaning', status: 'In Progress', color: '#60a5fa', icon: '🧹' },
                { title: 'Pipe Repair', status: 'Pending', color: '#fbbf24', icon: '🔧' },
                { title: 'Wall Painting', status: 'Completed', color: '#34d399', icon: '🎨' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.title}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: item.color,
                      background: `${item.color}22`,
                      border: `1px solid ${item.color}44`,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 0 40px', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, marginBottom: '32px', color: 'var(--color-text-muted)' }}>
            SERVICES WE COVER
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {categories.map((cat) => (
              <Link
                to="/auth"
                key={cat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px 12px',
                  background: cat.color,
                  border: `1px solid ${cat.border}`,
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="features-title">
            Everything you need,{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              nothing you don't
            </span>
          </h2>
          <p className="features-subtitle">
            Built for homeowners who want reliability, transparency, and peace of mind.
          </p>
          <div className="grid grid-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 'var(--radius-xl)',
              padding: '64px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', marginBottom: '32px' }}>
              Join thousands of homeowners who trust Zepnest for reliable home care.
            </p>
            <Link to="/auth" className="btn btn-primary btn-lg" id="cta-bottom-btn">
              Create Your Free Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '32px 0',
          color: 'var(--color-text-dim)',
          fontSize: '0.875rem',
        }}
      >
        <div className="container flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="flex gap-3" style={{ alignItems: 'center' }}>
            <div className="navbar-logo" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>Z</div>
            <span>© 2025 Zepnest. Home Care, At a Tap.</span>
          </div>
          <span>Built with ❤️ for the Zepnest Engineering Team</span>
        </div>
      </footer>
    </div>
  );
}
