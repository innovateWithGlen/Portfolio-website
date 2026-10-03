import { notFound } from 'next/navigation';
import LocalAdminDashboard from './LocalAdminDashboard';

export default function AdminPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return <LocalAdminDashboard />;
}
