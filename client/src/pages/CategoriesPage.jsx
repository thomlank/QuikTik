import { useState, useEffect } from "react";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { categoryApi } from "../utils/DjangoApiUtil";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import FormModal from "../components/FormModal";
import ConfirmModal from "../components/ConfirmModal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", description: "" });
    setSelectedCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await categoryApi.create(formData);
      } else {
        await categoryApi.update(selectedCategory.id, formData);
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.name?.[0] || "Failed to save category");
    }
  };

  const handleDelete = async () => {
    try {
      await categoryApi.delete(selectedCategory.id);
      setShowDeleteConfirm(false);
      await loadCategories();
    } catch (err) {
      alert("Failed to delete category. It may be in use by tickets.");
    }
  };

  if (loading) {
    return <LoadingState icon="bi-tags" title="Categories" />;
  }

  return (
    <div>
      <PageHeader
        icon="bi-tags"
        title="Categories"
        actionLabel="Create Category"
        onAction={openCreateModal}
      />

      <div className="page-content">
        {error && <Alert variant="danger">{error}</Alert>}

        {categories.length > 0 ? (
          <div className="card-grid">
            {categories.map((category) => (
              <Card key={category.id}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">{category.name}</h5>
                  </div>

                  {category.description && (
                    <p className="text-muted small mb-3">{category.description}</p>
                  )}

                  <div className="action-buttons">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="btn-action"
                      onClick={() => openEditModal(category)}
                    >
                      <i className="bi bi-pencil"></i>
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-action"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bi-tags"
            message="No categories yet. Create your first category!"
            actionLabel="Create Category"
            onAction={openCreateModal}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <FormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={modalMode === "create" ? "Create Category" : "Edit Category"}
        submitLabel={modalMode === "create" ? "Create Category" : "Save Changes"}
      >
        <Form.Group className="mb-3">
          <Form.Label>Category Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., Bug, Feature Request, Support"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Form.Group>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete"
        itemName={selectedCategory?.name}
        confirmLabel="Delete Category"
        confirmVariant="danger"
      />
    </div>
  );
}