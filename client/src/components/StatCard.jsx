import { Card } from "react-bootstrap";


export default function StatCard({ icon, value, label, color = "primary", onClick }) {
  const gradients = {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    success: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
    info: "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
    warning: "linear-gradient(135deg, #f09819 0%, #edde5d 100%)",
    danger: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
  };

  return (
    <Card
      className="stat-card hover-lift"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <Card.Body className="text-center">
        <div
          className="mb-3"
          style={{
            fontSize: "2.5rem",
            background: gradients[color] || gradients.primary,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <i className={icon}></i>
        </div>
        <div
          className="stat-value"
          style={{
            background: gradients[color] || gradients.primary,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </div>
        <div className="stat-label">{label}</div>
      </Card.Body>
    </Card>
  );
}