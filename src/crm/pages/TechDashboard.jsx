import { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Inbox, Trophy, XCircle, Package } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LeadTable from '../components/LeadTable';
import LeadDetailModal from '../components/LeadDetailModal';

export default function TechDashboard() {
  const { leads, users, currentUser, updateLeadStatus } = useCrm();
  const [tab, setTab] = useState('overview');
  const [selectedLead, setSelectedLead] = useState(null);

  const myLeads = leads.filter(l => l.assigned_to === currentUser?.id);
  const incoming = myLeads.filter(l => ['in-review', 'converted'].includes(l.status));
  const won = myLeads.filter(l => l.status === 'closed-won').length;
  const lost = myLeads.filter(l => l.status === 'closed-lost').length;

  return (
    <div className="crm-content">
      <div className="crm-page-header">
        <div>
          <h1>Technical Dashboard</h1>
          <p>Review incoming leads, discuss requirements, and close deals</p>
        </div>
      </div>

      <div className="crm-tabs">
        <button className={`crm-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`crm-tab ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>
          Incoming ({incoming.length})
        </button>
        <button className={`crm-tab ${tab === 'my-leads' ? 'active' : ''}`} onClick={() => setTab('my-leads')}>All My Leads ({myLeads.length})</button>
      </div>

      {tab === 'overview' && (
        <div className="crm-stats-grid">
          <StatsCard label="Incoming Leads" value={incoming.length} icon={Inbox} color="#8b5cf6" />
          <StatsCard label="Total Handled" value={myLeads.length} icon={Package} color="#3b82f6" />
          <StatsCard label="Closed Won" value={won} icon={Trophy} color="#22c55e" />
          <StatsCard label="Closed Lost" value={lost} icon={XCircle} color="#ef4444" />
        </div>
      )}

      {tab === 'incoming' && (
        <LeadTable
          leads={incoming}
          title="Incoming Leads for Review"
          users={users}
          showAssignee={false}
          statusEditable
          onStatusChange={updateLeadStatus}
          onRowClick={lead => setSelectedLead(lead)}
          filterStatuses={['in-review', 'converted', 'closed-won', 'closed-lost']}
        />
      )}

      {tab === 'my-leads' && (
        <LeadTable
          leads={myLeads}
          title="All My Leads"
          users={users}
          showAssignee={false}
          onRowClick={lead => setSelectedLead(lead)}
        />
      )}

      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
