import { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { ROLE_COLORS, ROLE_LABELS } from '../utils/constants';
import { Users, UserPlus, FileText, TrendingUp, Trophy, XCircle, Edit, Trash2, Clock, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LeadTable from '../components/LeadTable';
import TeamMemberModal from '../components/TeamMemberModal';
import LeadDetailModal from '../components/LeadDetailModal';

export default function AdminDashboard({ initialTab = 'overview' }) {
  const { users, leads, deleteUser, getStats, fetchGlobalActivity } = useCrm();
  const [tab, setTab] = useState(initialTab);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [logSearch]);

  const stats = getStats();

  // Sync tab when sidebar navigation changes
  useEffect(() => {
    handleTabChange(initialTab);
  }, [initialTab]);

  const handleTabChange = async (newTab) => {
    setTab(newTab);
    if (newTab === 'audit') {
      setLoadingLogs(true);
      const { data } = await fetchGlobalActivity();
      setLogs(data || []);
      setLoadingLogs(false);
    }
  };

  return (
    <div className="crm-content">
      <div className="crm-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your team and monitor all leads</p>
        </div>
      </div>

      <div className="crm-tabs">
        <button className={`crm-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>Overview</button>
        <button className={`crm-tab ${tab === 'team' ? 'active' : ''}`} onClick={() => handleTabChange('team')}>Team ({users.length})</button>
        <button className={`crm-tab ${tab === 'all-leads' ? 'active' : ''}`} onClick={() => handleTabChange('all-leads')}>All Leads ({leads.length})</button>
        <button className={`crm-tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => handleTabChange('audit')}>Audit Log</button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="crm-stats-grid">
            <StatsCard label="Total Leads" value={stats.total} icon={FileText} color="#3b82f6" />
            <StatsCard label="New / Unassigned" value={stats.newLeads} icon={UserPlus} color="#8b949e" />
            <StatsCard label="In Pipeline" value={stats.assigned + stats.contacted + stats.interested} icon={TrendingUp} color="#f97316" />
            <StatsCard label="Converted" value={stats.converted + stats.inReview} icon={TrendingUp} color="#8b5cf6" />
            <StatsCard label="Closed Won" value={stats.closedWon} icon={Trophy} color="#22c55e" />
            <StatsCard label="Closed Lost" value={stats.closedLost} icon={XCircle} color="#ef4444" />
          </div>

          {/* Team Overview */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Team Performance</h3>
          <div className="crm-team-grid">
            {users.map(user => {
              const userLeads = leads.filter(l => l.assigned_to === user.id);
              const won = userLeads.filter(l => l.status === 'closed-won').length;
              const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              const primaryRole = user.roles?.[0] || 'sales';

              return (
                <div key={user.id} className="crm-team-card">
                  <div className="crm-team-avatar" style={{ background: ROLE_COLORS[primaryRole] || '#666' }}>
                    {initials}
                  </div>
                  <div className="crm-team-info">
                    <h4>{user.name}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {(user.roles || []).map(r => (
                        <span key={r} className="crm-role-badge" style={{ background: `${ROLE_COLORS[r]}20`, color: ROLE_COLORS[r] }}>
                          {ROLE_LABELS[r]}
                        </span>
                      ))}
                    </div>
                    <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--crm-text-secondary)' }}>
                      {userLeads.length} leads · {won} won
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'team' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button className="crm-btn crm-btn-primary" onClick={() => setShowAddMember(true)}>
              <UserPlus size={16} /> Add Member
            </button>
          </div>

          <div className="crm-team-grid">
            {users.map(user => {
              const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              const primaryRole = user.roles?.[0] || 'sales';
              return (
                <div key={user.id} className="crm-team-card">
                  <div className="crm-team-avatar" style={{ background: ROLE_COLORS[primaryRole] || '#666' }}>
                    {initials}
                  </div>
                  <div className="crm-team-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {(user.roles || []).map(r => (
                        <span key={r} className="crm-role-badge" style={{ background: `${ROLE_COLORS[r]}20`, color: ROLE_COLORS[r] }}>
                          {ROLE_LABELS[r]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="crm-team-actions">
                    <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={() => setEditMember(user)}>
                      <Edit size={14} />
                    </button>
                    <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={() => { if (confirm(`Deactivate ${user.name}?`)) deleteUser(user.id); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'all-leads' && (
        <LeadTable
          leads={leads}
          title="All Leads"
          users={users}
          showAssignee
          showStatus
          onRowClick={lead => setSelectedLead(lead)}
        />
      )}

      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="crm-table-toolbar" style={{ margin: 0 }}>
            <h3>System Activity Log ({logs.length})</h3>
            <div className="crm-table-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingLogs ? (
            <div className="crm-loading">
              <span className="crm-loading-dot" />
              <span className="crm-loading-dot" />
              <span className="crm-loading-dot" />
            </div>
          ) : logs.length === 0 ? (
            <div className="crm-empty">
              <Clock size={40} style={{ color: 'var(--crm-text-muted)', marginBottom: 12 }} />
              <h3>No activity logs found</h3>
              <p>System activities will be listed here as they occur</p>
            </div>
          ) : (() => {
            const filteredLogs = logs.filter(log => {
              const q = logSearch.toLowerCase();
              return (
                log.user_name?.toLowerCase().includes(q) ||
                log.action?.toLowerCase().includes(q) ||
                log.details?.toLowerCase().includes(q)
              );
            });

            const totalPages = Math.ceil(filteredLogs.length / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, filteredLogs.length);
            const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

            return (
              <>
                <div className="crm-activity-log" style={{ background: 'var(--crm-bg-card)', border: '1px solid var(--crm-border)', borderRadius: 'var(--crm-radius)', padding: 24, maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                  {filteredLogs.length === 0 ? (
                    <div className="crm-empty" style={{ padding: '20px 0' }}>
                      <Search size={32} style={{ color: 'var(--crm-text-muted)', marginBottom: 8 }} />
                      <h3>No matching activity logs</h3>
                      <p>Try searching for a different action or user</p>
                    </div>
                  ) : (
                    paginatedLogs.map(log => (
                      <div key={log.id} className="crm-activity-item" style={{ marginBottom: 20 }}>
                        <div className="crm-activity-dot" style={{ background: 'var(--crm-accent)' }} />
                        <div className="crm-activity-content">
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--crm-text)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--crm-accent)', marginRight: 6 }}>{log.action}</span>
                            — {log.details}
                          </p>
                          <time style={{ display: 'block', fontSize: '0.75rem', color: 'var(--crm-text-secondary)', marginTop: 4 }}>
                            Performed by <strong style={{ color: 'var(--crm-text)' }}>{log.user_name}</strong> · {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </time>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {filteredLogs.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 24px',
                    border: '1px solid var(--crm-border)',
                    borderRadius: 'var(--crm-radius)',
                    background: 'var(--crm-bg-card)',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginTop: 8
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-secondary)' }}>
                      Showing <strong style={{ color: 'var(--crm-text)' }}>{filteredLogs.length === 0 ? 0 : startIndex + 1}</strong> to <strong style={{ color: 'var(--crm-text)' }}>{endIndex}</strong> of <strong style={{ color: 'var(--crm-text)' }}>{filteredLogs.length}</strong> activities
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        style={{ padding: '6px 8px' }}
                        title="First Page"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '6px 8px' }}
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-secondary)', padding: '0 8px' }}>
                        Page <strong style={{ color: 'var(--crm-text)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--crm-text)' }}>{totalPages}</strong>
                      </span>

                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        style={{ padding: '6px 8px' }}
                        title="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        style={{ padding: '6px 8px' }}
                        title="Last Page"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--crm-text-secondary)' }}>
                      <span>Items per page:</span>
                      <select
                        value={pageSize}
                        onChange={e => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="crm-input"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: 80, height: 'auto' }}
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {showAddMember && <TeamMemberModal onClose={() => setShowAddMember(false)} />}
      {editMember && <TeamMemberModal member={editMember} onClose={() => setEditMember(null)} />}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
