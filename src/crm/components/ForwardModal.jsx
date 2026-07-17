import { useState } from 'react';
import { X } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ROLE_COLORS, ROLE_LABELS } from '../utils/constants';

export default function ForwardModal({ leadId, onClose }) {
  const { users, forwardLead, currentUser } = useCrm();
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.roles?.includes('admin');

  // Show all team members except the current user
  const forwardableUsers = users.filter(u => u.id !== currentUser?.id);

  const handleForward = async () => {
    if (!selectedUser || !leadId) return;
    setLoading(true);
    await forwardLead(leadId, selectedUser);
    setLoading(false);
    onClose();
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h2>Forward Lead</h2>
          <button className="crm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="crm-modal-body">
          <p style={{ color: 'var(--crm-text-secondary)', fontSize: '0.88rem', marginTop: 0, marginBottom: 20 }}>
            Select a team member to forward this lead to.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {forwardableUsers.map(user => {
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
                  <div className="crm-user-avatar" style={{ background: ROLE_COLORS[user.role], width: 38, height: 38 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--crm-text-secondary)' }}>
                      {ROLE_LABELS[user.role]}{isAdmin ? ` · ${user.email}` : ''}
                    </div>
                  </div>
                  {selectedUser === user.id && (
                    <div style={{ color: 'var(--crm-accent)', fontWeight: 600, fontSize: '0.82rem' }}>Selected</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="crm-modal-footer">
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="crm-btn crm-btn-primary"
            onClick={handleForward}
            disabled={loading || !selectedUser}
          >
            {loading ? 'Forwarding...' : 'Forward Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
