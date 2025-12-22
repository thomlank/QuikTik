import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Badge, Card, Row, Col, Container } from "react-bootstrap";
import { ticketApi } from "../utils/DjangoApiUtil";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    myTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const tickets = await ticketApi.getAll();
      
      setStats({
        totalTickets: tickets.length,
        myTickets: tickets.filter(
          (t) => t.assigned_to === user?.id || t.created_by === user?.id
        ).length,
        openTickets: tickets.filter((t) => t.status === 1).length,
        urgentTickets: tickets.filter((t) => t.priority === 1).length,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === "admin") return "badge-role-admin";
    if (user?.teams?.some((t) => t.role === "lead")) return "badge-role-lead";
    return "badge-role-user";
  };

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Administrator";
    if (user?.teams?.some((t) => t.role === "lead")) return "Team Lead";
    return "User";
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <Container className="py-3">
          <h1 className="h3 mb-0 fw-bold">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </h1>
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-4">
        {/* Welcome Card */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h2 className="h5 mb-3">Welcome, {user?.first_name || user?.email}!</h2>
            <div className="d-flex align-items-center gap-2">
              <strong>Role:</strong>
              <Badge className={getRoleBadge()}>{getRoleLabel()}</Badge>
            </div>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row xs={1} md={2} lg={4} className="g-3 mb-4">
          <Col>
            <StatCard
              icon="bi-ticket-perforated"
              value={stats.totalTickets}
              label="Total Tickets"
              color="primary"
              onClick={() => navigate("/dashboard/tickets")}
            />
          </Col>
          <Col>
            <StatCard
              icon="bi-person-check"
              value={stats.myTickets}
              label="My Tickets"
              color="success"
              onClick={() => navigate("/dashboard/tickets")}
            />
          </Col>
          <Col>
            <StatCard
              icon="bi-hourglass-split"
              value={stats.openTickets}
              label="Open Tickets"
              color="info"
              onClick={() => navigate("/dashboard/tickets")}
            />
          </Col>
          <Col>
            <StatCard
              icon="bi-exclamation-triangle"
              value={stats.urgentTickets}
              label="Urgent Tickets"
              color="danger"
              onClick={() => navigate("/dashboard/tickets")}
            />
          </Col>
        </Row>

        {/* Teams Section */}
        {user?.teams && user.teams.length > 0 ? (
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="h5 mb-3">
                <i className="bi bi-people me-2"></i>
                Your Teams ({user.teams.length})
              </h3>
              <Row xs={1} md={2} lg={3} className="g-3">
                {user.teams.map((membership) => (
                  <Col key={membership.id || membership.team}>
                    <Card className="border h-100 hover-lift" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard/teams")}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">
                            {membership.team_name || `Team #${membership.team}`}
                          </h5>
                          <Badge
                            bg={membership.role === "lead" ? "success" : "secondary"}
                            className="text-capitalize"
                          >
                            {membership.role}
                          </Badge>
                        </div>
                        {membership.role === "lead" && (
                          <small className="text-muted">
                            <i className="bi bi-shield-check me-1"></i>
                            You can manage this team
                          </small>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center text-muted py-4">
                <i className="bi bi-people" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                <p className="mb-0 mt-2">
                  You are not currently assigned to any teams.
                </p>
                {user?.role === "admin" && (
                  <small>
                    <a href="/dashboard/teams" className="text-decoration-none">
                      Create a team
                    </a>{" "}
                    to get started
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}