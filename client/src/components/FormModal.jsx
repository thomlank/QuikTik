import { Modal, Button, Form } from "react-bootstrap";


export default function FormModal({
  show,
  onHide,
  onSubmit,
  title,
  submitLabel = "Save",
  loading = false,
  children,
}) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="btn-icon">
            <i className="bi bi-check-circle me-2"></i>
            {loading ? "Saving..." : submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}