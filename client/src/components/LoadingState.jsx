import { Spinner } from "react-bootstrap";
import PageHeader from "./PageHeader";

export default function LoadingState({ icon, title, message = "Loading..." }) {
  return (
    <div>
      <PageHeader icon={icon} title={title} showAction={false} />
      <div className="loading-container">
        <Spinner animation="border" />
        {message && <p className="text-muted mt-3">{message}</p>}
      </div>
    </div>
  );
}