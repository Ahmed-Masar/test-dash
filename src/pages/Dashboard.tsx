import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  // Redirect to management (main dashboard view)
  return <Navigate to="/dashboard/management" replace />;
}