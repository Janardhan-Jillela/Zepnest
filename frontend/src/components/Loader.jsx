export default function Loader({ size = 'md' }) {
  const styles = {
    sm: { width: 18, height: 18, borderWidth: 2 },
    md: { width: 24, height: 24, borderWidth: 3 },
    lg: { width: 40, height: 40, borderWidth: 4 },
  };

  const s = styles[size] || styles.md;

  return (
    <div
      className="spinner"
      style={{ width: s.width, height: s.height, borderWidth: s.borderWidth }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Loader size="lg" />
    </div>
  );
}
