const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_DOTS = {
  pending: '🟡',
  in_progress: '🔵',
  completed: '🟢',
  cancelled: '🔴',
};

export default function StatusBadge({ status }) {
  const cls = `badge badge-${status}`;
  return (
    <span className={cls}>
      <span style={{ fontSize: '8px' }}>●</span>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
