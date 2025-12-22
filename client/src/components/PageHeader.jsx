import { Button } from "react-bootstrap";


export default function PageHeader({ icon, title, actionLabel, onAction, showAction = true }) {
  return (
    <div className="page-header d-flex justify-content-between align-items-center">
      <h1 className="page-title">
        {icon && <i className={`${icon} me-2`}></i>}
        {title}
      </h1>
      {showAction && actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="btn-icon">
          <i className="bi bi-plus-circle me-2"></i>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}