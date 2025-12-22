import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Badge, Button, Form, Alert } from "react-bootstrap";
import { userApi } from "../utils/DjangoApiUtil";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import FormModal from "../components/FormModal";

export default function UsersPage() {
  const { user: currentUser, refreshUser } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "user",
    is_active: true,
  });

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "user",
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't populate password for edit
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role,
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        // Create new user (admin only)
        await userApi.create(formData);
      } else {
        // Update existing user (exclude password and email from update)
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          is_active: formData.is_active,
        };
        await userApi.update(selectedUser.id, updateData);
      }
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.email?.[0] || 
                       err.response?.data?.password?.[0] ||
                       err.response?.data?.error ||
                       "Failed to save user";
      alert(errorMsg);
    }
  };

  const handleDeactivate = async (user) => {
    if (!window.confirm(`Deactivate user ${user.email}?`)) return;

    try {
      await userApi.deactivate(user.id);
      await loadUsers();
    } catch (err) {
      alert("Failed to deactivate user");
    }
  };

  if (loading) {
    return <LoadingState icon="bi-person-gear" title="Users" />;
  }

  return (
    <div>
      <PageHeader 
        icon="bi-person-gear" 
        title="Users" 
        actionLabel="Create User"
        onAction={openCreateModal}
        showAction={isAdmin}
      />

      <div className="page-content">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="card-grid">
          {users.map((user) => (
            <Card key={user.id}>
              <Card.Body>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h5 className="mb-1">{user.full_name}</h5>
                    <small className="text-muted">{user.email}</small>
                  </div>
                  <Badge
                    className={
                      user.role === "admin" ? "badge-role-admin" : "badge-role-user"
                    }
                  >
                    {user.role}
                  </Badge>
                </div>

                {user.teams && user.teams.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="bi bi-people me-1"></i>
                      Teams: {user.teams.length}
                    </small>
                  </div>
                )}

                {!user.is_active && (
                  <Badge bg="secondary" className="mb-3">
                    Inactive
                  </Badge>
                )}

                <div className="action-buttons">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="btn-action"
                    onClick={() => openEditModal(user)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit User
                  </Button>
                  {user.id !== currentUser.id && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-action"
                      onClick={() => handleDeactivate(user)}
                    >
                      <i className="bi bi-person-x me-1"></i>
                      Deactivate
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      <FormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={modalMode === "create" ? "Create User" : "Edit User"}
        submitLabel={modalMode === "create" ? "Create User" : "Save Changes"}
      >
        {modalMode === "create" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                User will use this email to log in
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <Form.Text className="text-muted">
                Must be at least 8 characters
              </Form.Text>
            </Form.Group>
          </>
        )}

        {modalMode === "edit" && (
          <Alert variant="info" className="mb-3">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Editing: <strong>{formData.email}</strong>
              <br />
              Note: Email and password cannot be changed here
            </small>
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="First name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Last name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            disabled={modalMode === "edit" && selectedUser?.id === currentUser.id}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Form.Select>
          {modalMode === "edit" && selectedUser?.id === currentUser.id && (
            <Form.Text className="text-muted">You cannot change your own role</Form.Text>
          )}
        </Form.Group>

        {modalMode === "edit" && (
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Active Account"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={selectedUser?.id === currentUser.id}
            />
            {selectedUser?.id === currentUser.id ? (
              <Form.Text className="text-muted d-block">
                You cannot deactivate yourself
              </Form.Text>
            ) : (
              <Form.Text className="text-muted">Inactive users cannot log in</Form.Text>
            )}
          </Form.Group>
        )}
      </FormModal>
    </div>
  );
}