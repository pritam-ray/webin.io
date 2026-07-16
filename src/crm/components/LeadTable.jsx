import { useState } from 'react';
import { STATUS_LABELS, STATUS_COLORS, LEAD_STATUSES } from '../utils/constants';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function LeadTable({
  leads,
  title = 'Leads',
  showCheckbox = false,
  selectedIds = [],
  onSelectChange,
  showStatus = true,
  showAssignee = true,
  statusEditable = false,
  onStatusChange,
  onRowClick,
  actions,
  users = [],
  filterStatuses,
  extraColumns,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Filter
  let filtered = leads;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'all') {
    filtered = filtered.filter(l => l.status === statusFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortField] || '';
    let vb = b[sortField] || '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = sorted.length > 0 && sorted.every(l => selectedIds.includes(l.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectChange?.([]);
    } else {
      onSelectChange?.(sorted.map(l => l.id));
    }
  };

  const toggleOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectChange?.(selectedIds.filter(x => x !== id));
    } else {
      onSelectChange?.([...selectedIds, id]);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || '—';
  };

  const availableStatuses = filterStatuses || LEAD_STATUSES;

  return (
    <div className="crm-table-wrapper">
      <div className="crm-table-toolbar">
        <h3>{title} ({filtered.length})</h3>
        <div className="crm-table-filters">
          <div className="crm-table-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {showStatus && (
            <select
              className="crm-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: '0.82rem' }}
            >
              <option value="all">All Status</option>
              {availableStatuses.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          )}
          {actions}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="crm-empty">
          <h3>No leads found</h3>
          <p>{search ? 'Try a different search term' : 'No leads match the current filters'}</p>
        </div>
      ) : (
        <div className="crm-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                {showCheckbox && (
                  <th className="td-checkbox">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                )}
                <th onClick={() => toggleSort('name')}>
                  Name <SortIcon field="name" />
                </th>
                <th>Contact</th>
                <th onClick={() => toggleSort('company')}>
                  Company <SortIcon field="company" />
                </th>
                <th onClick={() => toggleSort('city')}>
                  City <SortIcon field="city" />
                </th>
                {showStatus && (
                  <th onClick={() => toggleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                )}
                {showAssignee && <th>Assigned To</th>}
                {extraColumns?.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th onClick={() => toggleSort('created_at')}>
                  Added <SortIcon field="created_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => onRowClick?.(lead)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {showCheckbox && (
                    <td className="td-checkbox" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleOne(lead.id)}
                      />
                    </td>
                  )}
                  <td>
                    <div className="crm-lead-name">{lead.name}</div>
                  </td>
                  <td>
                    <div className="crm-lead-contact">
                      {lead.phone && <a href={`tel:${lead.phone}`}>{lead.phone}</a>}
                      {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
                    </div>
                  </td>
                  <td><span className="crm-lead-company">{lead.company || '—'}</span></td>
                  <td>{lead.city || '—'}</td>
                  {showStatus && (
                    <td onClick={e => e.stopPropagation()}>
                      {statusEditable ? (
                        <select
                          className="crm-status-select"
                          value={lead.status}
                          onChange={e => onStatusChange?.(lead.id, e.target.value)}
                        >
                          {LEAD_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`crm-badge crm-badge-${lead.status}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                      )}
                    </td>
                  )}
                  {showAssignee && <td>{getUserName(lead.assigned_to)}</td>}
                  {extraColumns?.map(col => (
                    <td key={col.key}>{col.render(lead)}</td>
                  ))}
                  <td style={{ color: 'var(--crm-text-secondary)', fontSize: '0.8rem' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
