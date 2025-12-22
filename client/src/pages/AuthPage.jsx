import { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { authUtils } from "../utils/DjangoApiUtil";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear any existing errors
  };

  //form submit login/register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let data;
      if (isLogin) {
        data = await authUtils.login(formData.email, formData.password);
      } else {
        data = await authUtils.register(
          formData.email,
          formData.password,
          formData.first_name,
          formData.last_name,
          formData.role
        );
      }
      //stores token
      localStorage.setItem("token", data.token);
      //successful login/register takes to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Auth error: ", err);
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  //login/register toggle
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      email: "",
      password: "",
      role: "user",
      first_name: "",
      last_name: "",
    });
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg">
              <Card.Body className="p-5">
                {/* Header */}
                <h1 className="text-center mb-2 fw-bold">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-center text-muted mb-4">
                  {isLogin ? "Sign in to continue" : "Sign up to get started"}
                </p>

                {/* Error Message */}
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </Form.Group>

                  {/* Name Field (only shown during registration) */}
                  {!isLogin && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        First Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="First Name"
                      ></Form.Control>
                    </Form.Group>
                  )}
                  {!isLogin && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                      ></Form.Control>
                    </Form.Group>
                  )}

                  {/* Role Field (only shown during registration) */}
                  {!isLogin && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Role</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    </Form.Group>
                  )}

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-semibold"
                    disabled={loading}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    {loading
                      ? "Please wait..."
                      : isLogin
                      ? "Sign In"
                      : "Sign Up"}
                  </Button>
                </Form>

                {/* Toggle between Login and Register */}
                <div className="text-center mt-3">
                  <p className="text-muted mb-0">
                    {isLogin
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <Button
                      variant="link"
                      onClick={toggleMode}
                      className="p-0 text-decoration-none fw-semibold"
                      style={{ color: "#667eea" }}
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </Button>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}