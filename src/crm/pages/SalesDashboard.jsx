import { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { Phone, TrendingUp, Trophy, Send } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LeadTable from '../components/LeadTable';
import LeadDetailModal from '../components/LeadDetailModal';
import ForwardModal from '../components/ForwardModal';

export default function SalesDashboard({ initialTab = 'overview' }) {
  const { leads, users, currentUser, updateLeadStatus } = useCrm();
  const [tab, setTab] = useState(initialTab);
  const [selectedLead, setSelectedLead] = useState(null);
  const [forwardLeadId, setForwardLeadId] = useState(null);

  // Sync tab when sidebar navigation changes
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const myLeads = leads.filter(l => l.assigned_to === currentUser?.id);
  const active = myLeads.filter(l => !['closed-won', 'closed-lost'].includes(l.status));
  const won = myLeads.filter(l => l.status === 'closed-won').length;
  const contacted = myLeads.filter(l => l.status === 'contacted').length;
  const interested = myLeads.filter(l => l.status === 'interested').length;

  const forwardColumn = {
    key: 'forward',
    label: 'Action',
    render: (lead) => {
      if (lead.status === 'converted' || lead.status === 'interested') {
        return (
          <button
            className="crm-btn crm-btn-sm crm-btn-primary"
            onClick={(e) => { e.stopPropagation(); setForwardLeadId(lead.id); }}
          >
            <Send size={12} /> Forward
          </button>
        );
      }
      return null;
    }
  };

  return (
    <div className="crm-content">
      <div className="crm-page-header">
        <div>
          <h1>Sales Dashboard</h1>
          <p>Manage your assigned leads and track conversions</p>
        </div>
      </div>

      <div className="crm-tabs">
        <button className={`crm-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`crm-tab ${tab === 'my-leads' ? 'active' : ''}`} onClick={() => setTab('my-leads')}>My Leads ({myLeads.length})</button>
      </div>

      {tab === 'overview' && (
        <div className="crm-stats-grid">
          <StatsCard label="My Total Leads" value={myLeads.length} icon={Phone} color="#3b82f6" />
          <StatsCard label="Active Leads" value={active.length} icon={TrendingUp} color="#f97316" />
          <StatsCard label="Contacted" value={contacted} icon={Phone} color="#eab308" />
          <StatsCard label="Interested" value={interested} icon={TrendingUp} color="#8b5cf6" />
          <StatsCard label="Won" value={won} icon={Trophy} color="#22c55e" />
        </div>
      )}

      {tab === 'my-leads' && (
        <LeadTable
          leads={myLeads}
          title="My Assigned Leads"
          users={users}
          showAssignee={false}
          statusEditable
          onStatusChange={updateLeadStatus}
          onRowClick={lead => setSelectedLead(lead)}
          extraColumns={[forwardColumn]}
        />
      )}

      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      {forwardLeadId && <ForwardModal leadId={forwardLeadId} onClose={() => setForwardLeadId(null)} />}
    </div>
  );
}
