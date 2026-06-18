const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }) {
  const cls = `badge badge-${status}`;
  return (
    <span className={cls}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
