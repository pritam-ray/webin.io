import { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { FileText, Upload, UserCheck, Plus } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LeadTable from '../components/LeadTable';
import CsvUploader from '../components/CsvUploader';
import AddLeadModal from '../components/AddLeadModal';
import AssignModal from '../components/AssignModal';
import LeadDetailModal from '../components/LeadDetailModal';

export default function AssignerDashboard({ initialTab = 'overview' }) {
  const { leads, users, getStats } = useCrm();
  const [tab, setTab] = useState(initialTab);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  // Sync tab when sidebar navigation changes
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const stats = getStats();
  const unassignedLeads = leads.filter(l => l.status === 'new');

  return (
    <div className="crm-content">
      <div className="crm-page-header">
        <div>
          <h1>Lead Management</h1>
          <p>Upload, manage, and assign leads to the sales team</p>
        </div>
      </div>

      <div className="crm-tabs">
        <button className={`crm-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`crm-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>Upload Leads</button>
        <button className={`crm-tab ${tab === 'assign' ? 'active' : ''}`} onClick={() => setTab('assign')}>
          Assign ({unassignedLeads.length})
        </button>
        <button className={`crm-tab ${tab === 'all-leads' ? 'active' : ''}`} onClick={() => setTab('all-leads')}>All Leads</button>
      </div>

      {tab === 'overview' && (
        <div className="crm-stats-grid">
          <StatsCard label="Total Leads" value={stats.total} icon={FileText} color="#3b82f6" />
          <StatsCard label="Unassigned" value={stats.newLeads} icon={Upload} color="#f97316" subtext={stats.newLeads > 0 ? 'Needs assignment' : 'All assigned'} />
          <StatsCard label="Assigned" value={stats.assigned} icon={UserCheck} color="#22c55e" />
          <StatsCard label="In Pipeline" value={stats.contacted + stats.interested} icon={FileText} color="#8b5cf6" />
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setShowAddLead(true)}>
              <Plus size={16} /> Add Single Lead
            </button>
          </div>
          <CsvUploader onImportComplete={() => setTab('assign')} />
        </div>
      )}

      {tab === 'assign' && (
        <LeadTable
          leads={unassignedLeads}
          title="Unassigned Leads"
          users={users}
          showCheckbox
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          showAssignee={false}
          onRowClick={lead => setSelectedLead(lead)}
          actions={
            selectedIds.length > 0 && (
              <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={() => setShowAssign(true)}>
                <UserCheck size={14} /> Assign {selectedIds.length} Lead{selectedIds.length > 1 ? 's' : ''}
              </button>
            )
          }
        />
      )}

      {tab === 'all-leads' && (
        <LeadTable
          leads={leads}
          title="All Leads"
          users={users}
          showAssignee
          onRowClick={lead => setSelectedLead(lead)}
        />
      )}

      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} />}
      {showAssign && <AssignModal leadIds={selectedIds} onClose={() => { setShowAssign(false); setSelectedIds([]); }} />}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
