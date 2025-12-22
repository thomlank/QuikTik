import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Badge, Button, Form, Alert, ListGroup } from "react-bootstrap";
import { teamApi, userApi } from "../utils/DjangoApiUtil";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import FormModal from "../components/FormModal";
import ConfirmModal from "../components/ConfirmModal";

export default function TeamsPage() {
  const { user: currentUser, refreshUser } = useOutletContext();

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [teamFormData, setTeamFormData] = useState({
    name: "",
    can_view_all_tickets: false,
    can_assign_tickets: false,
    can_close_tickets: false,
    can_delete_tickets: false,
  });

  const [memberFormData, setMemberFormData] = useState({
    user_id: "",
    role: "member",
    searchTerm: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Permission checks
  const isAdmin = currentUser?.role === "admin";
  const ledTeamIds = currentUser?.teams?.filter((t) => t.role === "lead").map((t) => t.team) || [];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, usersData] = await Promise.all([
        teamApi.getAll(),
        userApi.getAll().catch(() => []),
      ]);
      setTeams(teamsData);
      setUsers(usersData);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateTeamModal = () => {
    setModalMode("create");
    setTeamFormData({
      name: "",
      can_view_all_tickets: false,
      can_assign_tickets: false,
      can_close_tickets: false,
      can_delete_tickets: false,
    });
    setShowTeamModal(true);
  };

  const openEditTeamModal = (team) => {
    setModalMode("edit");
    setSelectedTeam(team);
    setTeamFormData({
      name: team.name,
      can_view_all_tickets: team.can_view_all_tickets || false,
      can_assign_tickets: team.can_assign_tickets || false,
      can_close_tickets: team.can_close_tickets || false,
      can_delete_tickets: team.can_delete_tickets || false,
    });
    setShowTeamModal(true);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await teamApi.create(teamFormData);
      } else {
        await teamApi.update(selectedTeam.id, teamFormData);
      }
      setShowTeamModal(false);
      await loadData();
    } catch (err) {
      alert("Failed to save team");
    }
  };

  const openAddMemberModal = (team) => {
    setSelectedTeam(team);
    setMemberFormData({ user_id: "", role: "member", searchTerm: "" });
    setShowMemberModal(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberFormData.user_id) {
      alert("Please select a user");
      return;
    }

    try {
      await teamApi.addMember(selectedTeam.id, memberFormData.user_id, memberFormData.role);
      setShowMemberModal(false);
      await loadData();

      // Refresh current user data if they were added to a team
      if (memberFormData.user_id === currentUser?.id && refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (membershipId, membership) => {
    if (!window.confirm("Remove this member from the team?")) return;

    try {
      await teamApi.removeMember(membershipId);
      await loadData();

      // Refresh current user data if they removed themselves from a team
      if (membership?.user === currentUser?.id && refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  const handleToggleRole = async (membership) => {
    const newRole = membership.role === "lead" ? "member" : "lead";
    try {
      await teamApi.updateMemberRole(membership.id, newRole);
      await loadData();

      // Refresh current user data if they changed their own role
      if (membership.user === currentUser?.id && refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await teamApi.delete(itemToDelete.id);
      setShowDeleteConfirm(false);
      await loadData();
    } catch (err) {
      alert("Failed to delete team");
    }
  };

  const canManageTeam = (team) => {
    return isAdmin || ledTeamIds.includes(team.id);
  };

  const getAvailableUsers = () => {
    if (!selectedTeam) return [];
    const teamMemberIds = selectedTeam.members?.map((m) => m.user) || [];
    return users.filter((u) => !teamMemberIds.includes(u.id));
  };

  const filteredUsers = getAvailableUsers().filter(
    (u) =>
      u.full_name.toLowerCase().includes(memberFormData.searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(memberFormData.searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState icon="bi-people" title="Teams" />;
  }

  return (
    <div>
      <PageHeader
        icon="bi-people"
        title="Teams"
        actionLabel="Create Team"
        onAction={openCreateTeamModal}
        showAction={isAdmin}
      />

      <div className="page-content">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="card-grid">
          {teams.map((team) => (
            <Card key={team.id}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>{team.name}</span>
                <Badge bg="info">{team.member_count} members</Badge>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted fw-semibold">Members:</small>
                  <div className="mt-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member) => (
                        <div
                          key={member.id}
                          className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                        >
                          <div>
                            <div className="small">{member.user_name}</div>
                            <Badge
                              bg={member.role === "lead" ? "success" : "secondary"}
                              className="text-capitalize"
                            >
                              {member.role}
                            </Badge>
                          </div>
                          {canManageTeam(team) && (
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleToggleRole(member)}
                                title="Toggle role"
                              >
                                <i className="bi bi-arrow-repeat"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleRemoveMember(member.id, member)}
                                title="Remove member"
                              >
                                <i className="bi bi-x"></i>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <small className="text-muted">No members yet</small>
                    )}
                  </div>
                </div>

                <div className="action-buttons">
                  {canManageTeam(team) && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="btn-action"
                      onClick={() => openAddMemberModal(team)}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Add Member
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="btn-action"
                        onClick={() => openEditTeamModal(team)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit Team
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="btn-action"
                        onClick={() => {
                          setItemToDelete(team);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete Team
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      {/* Create/Edit Team Modal */}
      <FormModal
        show={showTeamModal}
        onHide={() => setShowTeamModal(false)}
        onSubmit={handleTeamSubmit}
        title={modalMode === "create" ? "Create Team" : "Edit Team"}
        submitLabel={modalMode === "create" ? "Create Team" : "Save Changes"}
      >
        <Form.Group className="mb-3">
          <Form.Label>Team Name</Form.Label>
          <Form.Control
            type="text"
            value={teamFormData.name}
            onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
            required
          />
        </Form.Group>

        <div className="mb-3">
          <Form.Label className="fw-semibold">Team Permissions</Form.Label>
          <Form.Check
            type="checkbox"
            label="Can view all tickets"
            checked={teamFormData.can_view_all_tickets}
            onChange={(e) =>
              setTeamFormData({ ...teamFormData, can_view_all_tickets: e.target.checked })
            }
          />
          <Form.Check
            type="checkbox"
            label="Can assign tickets"
            checked={teamFormData.can_assign_tickets}
            onChange={(e) =>
              setTeamFormData({ ...teamFormData, can_assign_tickets: e.target.checked })
            }
          />
          <Form.Check
            type="checkbox"
            label="Can close tickets"
            checked={teamFormData.can_close_tickets}
            onChange={(e) =>
              setTeamFormData({ ...teamFormData, can_close_tickets: e.target.checked })
            }
          />
          <Form.Check
            type="checkbox"
            label="Can delete tickets"
            checked={teamFormData.can_delete_tickets}
            onChange={(e) =>
              setTeamFormData({ ...teamFormData, can_delete_tickets: e.target.checked })
            }
          />
        </div>
      </FormModal>

      {/* Add Member Modal */}
      <FormModal
        show={showMemberModal}
        onHide={() => setShowMemberModal(false)}
        onSubmit={handleAddMember}
        title={`Add Member to ${selectedTeam?.name}`}
        submitLabel="Add Member"
      >
        <Form.Group className="mb-3">
          <Form.Label>Search User</Form.Label>
          <Form.Control
            type="text"
            placeholder="Type to search..."
            value={memberFormData.searchTerm}
            onChange={(e) => setMemberFormData({ ...memberFormData, searchTerm: e.target.value })}
          />
        </Form.Group>

        {memberFormData.searchTerm && (
          <div className="mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <ListGroup>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <ListGroup.Item
                    key={user.id}
                    action
                    active={memberFormData.user_id === user.id}
                    onClick={() =>
                      setMemberFormData({
                        ...memberFormData,
                        user_id: user.id,
                        searchTerm: user.full_name,
                      })
                    }
                  >
                    <div>{user.full_name}</div>
                    <small className="text-muted">{user.email}</small>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No users found</ListGroup.Item>
              )}
            </ListGroup>
          </div>
        )}

        <Form.Group>
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={memberFormData.role}
            onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
          >
            <option value="member">Member</option>
            <option value="lead">Team Lead</option>
          </Form.Select>
        </Form.Group>
      </FormModal>

      {/* Delete Team Confirmation */}
      <ConfirmModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTeam}
        title="Delete Team"
        message="Are you sure you want to delete"
        itemName={itemToDelete?.name}
        confirmLabel="Delete Team"
        confirmVariant="danger"
      />
    </div>
  );
}