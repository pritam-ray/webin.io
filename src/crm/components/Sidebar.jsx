import { useCrm } from '../context/CrmContext';
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../utils/constants';
import { Users, Upload, Phone, BarChart3, FileText, UserCheck, LogOut, Inbox, FileSpreadsheet, ClipboardList } from 'lucide-react';

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  const { currentUser, logout, leads, sheets } = useCrm();
  const roles = currentUser?.roles || [];

  const getNavItems = () => {
    const items = [];
    const addedIds = new Set();

    const addItem = (item) => {
      if (item.section) {
        if (!addedIds.has(`sec-${item.section}`)) {
          items.push(item);
          addedIds.add(`sec-${item.section}`);
        }
        return;
      }
      if (!addedIds.has(item.id)) {
        items.push(item);
        addedIds.add(item.id);
      }
    };

    addItem({ section: 'Dashboard' });
    addItem({ id: 'overview', label: 'Overview', icon: BarChart3 });

    if (roles.includes(ROLES.ADMIN)) {
      addItem({ section: 'Management' });
      addItem({ id: 'team', label: 'Team Members', icon: Users });
      addItem({ id: 'all-leads', label: 'All Leads', icon: FileText, badge: leads.length || null });
      addItem({ id: 'audit', label: 'Audit Log', icon: ClipboardList });
    }

    if (roles.includes(ROLES.LEAD_ASSIGNER)) {
      addItem({ section: 'Leads' });
      addItem({ id: 'upload', label: 'Upload Leads', icon: Upload });
      const unassigned = leads.filter(l => l.status === 'new').length;
      addItem({ id: 'assign', label: 'Assign Leads', icon: UserCheck, badge: unassigned || null });
    }

    if (roles.includes(ROLES.SALES)) {
      const myLeads = leads.filter(l => l.assigned_to === currentUser?.id).length;
      addItem({ section: 'My Work' });
      addItem({ id: 'my-leads', label: 'My Leads', icon: Phone, badge: myLeads || null });
    }

    if (roles.includes(ROLES.TECHNICAL)) {
      const incoming = leads.filter(l =>
        l.assigned_to === currentUser?.id &&
        ['in-review', 'converted'].includes(l.status)
      ).length;
      addItem({ section: 'My Work' });
      addItem({ id: 'incoming', label: 'Incoming Leads', icon: Inbox, badge: incoming || null });
    }

    // Shared across all roles
    addItem({ section: 'Collaboration' });
    addItem({ id: 'sheets', label: 'Client Lists (Excel)', icon: FileSpreadsheet, badge: sheets.length || null });

    return items;
  };

  const navItems = getNavItems();
  const initials = currentUser?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      {isOpen && <div className="crm-sidebar-overlay" onClick={onClose} />}
      <aside className={`crm-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="crm-sidebar-header">
          <div className="crm-sidebar-brand">
            <div className="crm-sidebar-logo">W</div>
            <div className="crm-sidebar-brand-text">
              <h2>Webing CRM</h2>
              <span>Internal Portal</span>
            </div>
          </div>
        </div>

        <nav className="crm-sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={`s-${i}`} className="crm-sidebar-section-label">{item.section}</div>;
            }
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`crm-sidebar-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => { onNavigate(item.id); onClose(); }}
              >
                <Icon />
                {item.label}
                {item.badge && <span className="link-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="crm-sidebar-footer">
          <div className="crm-user-card">
            <div className="crm-user-avatar" style={{ background: ROLE_COLORS[roles[0] || 'sales'] || '#666' }}>
              {initials}
            </div>
            <div className="crm-user-info">
              <h4>{currentUser?.name}</h4>
              <span style={{ fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {roles.map(r => ROLE_LABELS[r] || r).join(', ')}
              </span>
            </div>
            <button className="crm-logout-btn" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
