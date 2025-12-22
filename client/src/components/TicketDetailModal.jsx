import { Modal, Button, Badge, Card, Form } from "react-bootstrap";

export default function TicketDetailModal({
  show,
  onHide,
  ticket,
  getStatusBadge,
  getPriorityBadge,
  commentText,
  onCommentChange,
  onCommentSubmit,
}) {
  if (!ticket) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{ticket.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Ticket Details */}
        <div className="mb-3">
          <div className="d-flex gap-2 mb-3">
            <Badge className={getStatusBadge(ticket.status)}>
              {ticket.status_label}
            </Badge>
            <Badge className={getPriorityBadge(ticket.priority)}>
              {ticket.priority_label}
            </Badge>
            {ticket.category_name && (
              <Badge bg="secondary">{ticket.category_name}</Badge>
            )}
          </div>

          <div className="mb-3">
            <h6>Description</h6>
            <p className="text-muted">{ticket.description}</p>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <small className="text-muted d-block">
                <strong>Created by:</strong> {ticket.created_by_email}
              </small>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block">
                <strong>Assigned to:</strong>{" "}
                {ticket.assigned_to_email || "Unassigned"}
              </small>
            </div>
          </div>

          {ticket.team_name && (
            <div className="mb-3">
              <small className="text-muted">
                <strong>Team:</strong> {ticket.team_name}
              </small>
            </div>
          )}
        </div>

        <hr />

        {/* Comments Section */}
        <div>
          <h6 className="mb-3">Comments ({ticket.comments?.length || 0})</h6>

          <div style={{ maxHeight: "300px", overflowY: "auto" }} className="mb-3">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment) => (
                <Card key={comment.id} className="mb-2">
                  <Card.Body className="py-2">
                    <div className="d-flex justify-content-between">
                      <strong>{comment.author_name}</strong>
                      <small className="text-muted">
                        {new Date(comment.created_at).toLocaleString()}
                      </small>
                    </div>
                    <p className="mb-0 mt-1">{comment.content}</p>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p className="text-muted">No comments yet</p>
            )}
          </div>

          {/* Add Comment Form */}
          <Form onSubmit={onCommentSubmit}>
            <Form.Group className="mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Add a comment..."
                value={commentText}
                onChange={onCommentChange}
              />
            </Form.Group>
            <Button variant="primary" size="sm" type="submit" className="btn-icon">
              <i className="bi bi-chat me-2"></i>
              Add Comment
            </Button>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}