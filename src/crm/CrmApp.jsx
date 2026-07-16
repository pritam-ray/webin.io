import { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import CrmLogin from './CrmLogin';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import AssignerDashboard from './pages/AssignerDashboard';
import SalesDashboard from './pages/SalesDashboard';
import TechDashboard from './pages/TechDashboard';
import SheetManager from './pages/SheetManager';
import { ROLES } from './utils/constants';
import { Menu } from 'lucide-react';
import './CrmApp.css';

function CrmShell() {
  const { currentUser, loading, toasts } = useCrm();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');

  if (loading) {
    return (
      <div className="crm-root">
        <div className="crm-loading">
          <span className="crm-loading-dot" />
          <span className="crm-loading-dot" />
          <span className="crm-loading-dot" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="crm-root">
        <CrmLogin />
      </div>
    );
  }

  const renderPage = () => {
    const roles = currentUser.roles || [];

    // Shared collaboration tools
    if (activePage === 'sheets') {
      return <SheetManager />;
    }

    // Role-specific page rendering — pass activePage so dashboards open the correct tab
    if (roles.includes(ROLES.ADMIN)) {
      if (['overview', 'team', 'all-leads', 'audit'].includes(activePage)) {
        return <AdminDashboard initialTab={activePage} />;
      }
    }

    if (roles.includes(ROLES.LEAD_ASSIGNER)) {
      if (['upload', 'assign'].includes(activePage)) {
        return <AssignerDashboard initialTab={activePage} />;
      }
    }

    if (roles.includes(ROLES.SALES)) {
      if (activePage === 'my-leads') {
        return <SalesDashboard initialTab={activePage} />;
      }
    }

    if (roles.includes(ROLES.TECHNICAL)) {
      if (['incoming', 'tech-leads'].includes(activePage)) {
        return <TechDashboard initialTab={activePage} />;
      }
    }

    // Fallback/Default dashboard based on highest privilege role
    if (roles.includes(ROLES.ADMIN)) return <AdminDashboard initialTab="overview" />;
    if (roles.includes(ROLES.LEAD_ASSIGNER)) return <AssignerDashboard initialTab="overview" />;
    if (roles.includes(ROLES.SALES)) return <SalesDashboard initialTab="overview" />;
    if (roles.includes(ROLES.TECHNICAL)) return <TechDashboard initialTab="overview" />;
    
    return <AdminDashboard initialTab="overview" />;
  };

  return (
    <div className="crm-root">
      <div className="crm-layout">
        <button
          className="crm-mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>

        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="crm-main">
          {renderPage()}
        </main>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="crm-toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`crm-toast crm-toast-${toast.type}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrmApp() {
  return (
    <CrmProvider>
      <CrmShell />
    </CrmProvider>
  );
}
