export default function EmptyState({ icon, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={icon}></i>
      </div>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary mt-2" onClick={onAction}>
          <i className="bi bi-plus-circle me-2"></i>
          {actionLabel}
        </button>
      )}
    </div>
  );
}