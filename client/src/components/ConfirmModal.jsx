import { Modal, Button, Alert } from "react-bootstrap";

/**
 * Reusable confirmation modal
 * @param {boolean} show - Whether modal is visible
 * @param {function} onHide - Close handler
 * @param {function} onConfirm - Confirm action handler
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmLabel - Confirm button label (default: "Confirm")
 * @param {string} confirmVariant - Confirm button variant (default: "danger")
 * @param {string} itemName - Name of item being acted on (optional, for highlighting)
 */
export default function ConfirmModal({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  itemName,
}) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning">
          {message}
          {itemName && (
            <>
              {" "}
              <strong>{itemName}</strong>?
            </>
          )}
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} className="btn-icon">
          <i className={`bi bi-${confirmVariant === "danger" ? "trash" : "check-circle"}`}></i>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}