import { useState } from 'react';
import { X } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ROLE_COLORS, ROLE_LABELS } from '../utils/constants';

export default function AssignModal({ leadIds = [], onClose }) {
  const { users, assignLeadsBulk } = useCrm();
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  const salesUsers = users.filter(u => u.roles?.includes('sales'));

  const handleAssign = async () => {
    if (!selectedUser || !leadIds.length) return;
    setLoading(true);
    await assignLeadsBulk(leadIds, selectedUser);
    setLoading(false);
    onClose();
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h2>Assign {leadIds.length} Lead{leadIds.length > 1 ? 's' : ''}</h2>
          <button className="crm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="crm-modal-body">
          <p style={{ color: 'var(--crm-text-secondary)', fontSize: '0.88rem', marginTop: 0, marginBottom: 20 }}>
            Select a sales team member to assign the selected leads to.
          </p>

          {salesUsers.length === 0 ? (
            <div className="crm-empty" style={{ padding: '32px 0' }}>
              <h3>No sales members</h3>
              <p>Add sales team members first from the Admin panel.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {salesUsers.map(user => {
                const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 'var(--crm-radius)',
                      border: `2px solid ${selectedUser === user.id ? 'var(--crm-accent)' : 'var(--crm-border)'}`,
                      background: selectedUser === user.id ? 'var(--crm-accent-glow)' : 'var(--crm-bg-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div className="crm-user-avatar" style={{ background: ROLE_COLORS[user.roles?.[0] || 'sales'], width: 38, height: 38 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--crm-text-secondary)' }}>{user.email}</div>
                    </div>
                    {selectedUser === user.id && (
                      <div style={{ color: 'var(--crm-accent)', fontWeight: 600, fontSize: '0.82rem' }}>Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="crm-modal-footer">
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="crm-btn crm-btn-primary"
            onClick={handleAssign}
            disabled={loading || !selectedUser}
          >
            {loading ? 'Assigning...' : 'Assign Leads'}
          </button>
        </div>
      </div>
    </div>
  );
}
