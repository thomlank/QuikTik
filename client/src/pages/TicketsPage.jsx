import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Badge, Button, Form, Alert } from "react-bootstrap";
import { ticketApi, categoryApi, userApi, teamApi } from "../utils/DjangoApiUtil";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import FormModal from "../components/FormModal";
import ConfirmModal from "../components/ConfirmModal";
import TicketDetailModal from "../components/TicketDetailModal";

export default function TicketsPage() {
  const { user: currentUser, refreshUser } = useOutletContext();

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [ticketFormData, setTicketFormData] = useState({
    title: "",
    description: "",
    priority: 3,
    category: "",
  });

  const [assignFormData, setAssignFormData] = useState({
    assigned_to: "",
    assigned_to_team: "",
  });

  const [commentText, setCommentText] = useState("");

  // Permission checks
  const isAdmin = currentUser?.role === "admin";
  const isTeamLead =
    currentUser?.is_team_lead || currentUser?.teams?.some((t) => t.role === "lead") || false;
  const canAssign = isAdmin || isTeamLead;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, categoriesData, teamsData] = await Promise.all([
        ticketApi.getAll(),
        categoryApi.getAll(),
        teamApi.getAll(),
      ]);
      setTickets(ticketsData);
      setCategories(categoriesData);
      setTeams(teamsData);

      if (canAssign) {
        const usersData = await userApi.getAll();
        setUsers(usersData);
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setTicketFormData({ title: "", description: "", priority: 3, category: "" });
    setShowTicketModal(true);
  };

  const openEditModal = (ticket) => {
    setModalMode("edit");
    setSelectedTicket(ticket);
    setTicketFormData({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category || "",
      status: ticket.status,
    });
    setShowTicketModal(true);
  };

  const openDetailModal = async (ticket) => {
    setSelectedTicket(ticket);
    setCommentText("");
    setShowDetailModal(true);
  };

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setAssignFormData({
      assigned_to: ticket.assigned_to || "",
      assigned_to_team: ticket.assigned_to_team || "",
    });
    setShowAssignModal(true);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await ticketApi.create(ticketFormData);
      } else {
        await ticketApi.update(selectedTicket.id, ticketFormData);
      }
      setShowTicketModal(false);
      await loadData();
    } catch (err) {
      alert("Failed to save ticket");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const assignData = {
        assigned_to: assignFormData.assigned_to === "" ? null : assignFormData.assigned_to,
        assigned_to_team: assignFormData.assigned_to_team === "" ? null : assignFormData.assigned_to_team,
      };

      await ticketApi.assign(selectedTicket.id, assignData);
      setShowAssignModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign ticket");
    }
  };

  const handleDelete = async () => {
    try {
      await ticketApi.delete(selectedTicket.id);
      setShowDeleteConfirm(false);
      await loadData();
    } catch (err) {
      alert("Failed to delete ticket");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await ticketApi.addComment(selectedTicket.id, commentText);
      setCommentText("");
      const updatedTicket = await ticketApi.getById(selectedTicket.id);
      setSelectedTicket(updatedTicket);
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const canEdit = (ticket) => {
    return isAdmin || isTeamLead || ticket.created_by === currentUser.id;
  };

  const canDelete = (ticket) => {
    return isAdmin || isTeamLead || ticket.created_by === currentUser.id;
  };

  const getAssignableUsers = () => {
    if (isAdmin) return users;
    const ledTeamIds = currentUser?.teams?.filter((t) => t.role === "lead").map((t) => t.team) || [];
    return users.filter((u) => u.teams?.some((t) => ledTeamIds.includes(t.team)));
  };

  const getAssignableTeams = () => {
    if (isAdmin) return teams;
    const ledTeamIds = currentUser?.teams?.filter((t) => t.role === "lead").map((t) => t.team) || [];
    return teams.filter((t) => ledTeamIds.includes(t.id));
  };

  const getStatusBadge = (status) => {
    const classes = {
      1: "badge-status-open",
      2: "badge-status-in-progress",
      3: "badge-status-resolved",
      4: "badge-status-closed",
    };
    return classes[status] || "bg-secondary";
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      1: "badge-priority-urgent",
      2: "badge-priority-high",
      3: "badge-priority-medium",
      4: "badge-priority-low",
    };
    return classes[priority] || "bg-secondary";
  };

  if (loading) {
    return <LoadingState icon="bi-ticket-perforated" title="Tickets" />;
  }

  return (
    <div>
      <PageHeader
        icon="bi-ticket-perforated"
        title="Tickets"
        actionLabel="Create Ticket"
        onAction={openCreateModal}
      />

      <div className="page-content">
        {error && <Alert variant="danger">{error}</Alert>}

        {tickets.length > 0 ? (
          <div className="card-grid">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                onClick={() => openDetailModal(ticket)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <div className="mb-3">
                    <h5 className="mb-2">{ticket.title}</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge className={getStatusBadge(ticket.status)}>
                        {ticket.status_label}
                      </Badge>
                      <Badge className={getPriorityBadge(ticket.priority)}>
                        {ticket.priority_label}
                      </Badge>
                      {ticket.category_name && <Badge bg="secondary">{ticket.category_name}</Badge>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      <i className="bi bi-person me-1"></i>
                      Created by: {ticket.created_by_email}
                    </small>
                    {ticket.assigned_to_email && (
                      <small className="text-muted d-block">
                        <i className="bi bi-person-check me-1"></i>
                        Assigned to: {ticket.assigned_to_email}
                      </small>
                    )}
                    {ticket.team_name && (
                      <small className="text-muted d-block">
                        <i className="bi bi-people me-1"></i>
                        Team: {ticket.team_name}
                      </small>
                    )}
                  </div>

                  <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    {canAssign && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="btn-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAssignModal(ticket);
                        }}
                      >
                        <i className="bi bi-person-plus me-1"></i>
                        Assign
                      </Button>
                    )}
                    {canEdit(ticket) && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="btn-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(ticket);
                        }}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                    )}
                    {canDelete(ticket) && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="btn-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bi-ticket-perforated"
            message="No tickets yet. Create your first ticket!"
            actionLabel="Create Ticket"
            onAction={openCreateModal}
          />
        )}
      </div>

      {/* Create/Edit Ticket Modal */}
      <FormModal
        show={showTicketModal}
        onHide={() => setShowTicketModal(false)}
        onSubmit={handleTicketSubmit}
        title={modalMode === "create" ? "Create Ticket" : "Edit Ticket"}
        submitLabel={modalMode === "create" ? "Create Ticket" : "Save Changes"}
      >
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={ticketFormData.title}
            onChange={(e) => setTicketFormData({ ...ticketFormData, title: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={ticketFormData.description}
            onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
            required
          />
        </Form.Group>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={ticketFormData.priority}
                onChange={(e) =>
                  setTicketFormData({ ...ticketFormData, priority: parseInt(e.target.value) })
                }
              >
                <option value={4}>Low</option>
                <option value={3}>Medium</option>
                <option value={2}>High</option>
                <option value={1}>Urgent</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={ticketFormData.category}
                onChange={(e) => setTicketFormData({ ...ticketFormData, category: e.target.value })}
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        {modalMode === "edit" && (
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={ticketFormData.status}
              onChange={(e) =>
                setTicketFormData({ ...ticketFormData, status: parseInt(e.target.value) })
              }
            >
              <option value={1}>Open</option>
              <option value={2}>In Progress</option>
              <option value={3}>Resolved</option>
              <option value={4}>Closed</option>
            </Form.Select>
          </Form.Group>
        )}
      </FormModal>

      {/* Assign Ticket Modal */}
      <FormModal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        onSubmit={handleAssign}
        title="Assign Ticket"
        submitLabel="Assign Ticket"
      >
        <Form.Group className="mb-3">
          <Form.Label>Assign to User</Form.Label>
          <Form.Select
            value={assignFormData.assigned_to}
            onChange={(e) => setAssignFormData({ ...assignFormData, assigned_to: e.target.value })}
          >
            <option value="">Unassigned</option>
            {getAssignableUsers().map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Assign to Team</Form.Label>
          <Form.Select
            value={assignFormData.assigned_to_team}
            onChange={(e) =>
              setAssignFormData({ ...assignFormData, assigned_to_team: e.target.value })
            }
          >
            <option value="">No Team</option>
            {getAssignableTeams().map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Alert variant="info" className="mb-0">
          <small>You can assign to a user, team, or both</small>
        </Alert>
      </FormModal>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        ticket={selectedTicket}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        commentText={commentText}
        onCommentChange={(e) => setCommentText(e.target.value)}
        onCommentSubmit={handleAddComment}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmLabel="Delete Ticket"
        confirmVariant="danger"
      />
    </div>
  );
}