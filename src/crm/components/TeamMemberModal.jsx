import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ROLES } from '../utils/constants';

export default function TeamMemberModal({ member, onClose }) {
  const { addUser, updateUser } = useCrm();
  const isEdit = !!member;

  const [form, setForm] = useState({
    name: '',
    email: '',
    pin: '0000',
    roles: [ROLES.SALES],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        pin: member.pin,
        roles: member.roles || [],
      });
    }
  }, [member]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleRole = (role) => {
    setForm(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.roles.length === 0) return;
    setLoading(true);

    if (isEdit) {
      await updateUser(member.id, form);
    } else {
      await addUser(form);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h2>{isEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
          <button className="crm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-body">
            <div className="crm-form-group">
              <label>Name *</label>
              <input className="crm-input" placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} autoFocus />
            </div>
            <div className="crm-form-group">
              <label>Email *</label>
              <input className="crm-input" type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="crm-form-group">
              <label>PIN / Password</label>
              <input className="crm-input" placeholder="Login PIN or Password" value={form.pin} onChange={e => update('pin', e.target.value)} />
            </div>

            <div className="crm-form-group" style={{ marginTop: 8 }}>
              <label>Roles (Select all that apply) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 8 }}>
                <label className="crm-flex" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.roles.includes('admin')} onChange={() => toggleRole('admin')} style={{ width: 16, height: 16, accentColor: 'var(--crm-accent)', cursor: 'pointer' }} />
                  Admin
                </label>
                <label className="crm-flex" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.roles.includes('lead-assigner')} onChange={() => toggleRole('lead-assigner')} style={{ width: 16, height: 16, accentColor: 'var(--crm-accent)', cursor: 'pointer' }} />
                  Lead Assigner
                </label>
                <label className="crm-flex" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.roles.includes('sales')} onChange={() => toggleRole('sales')} style={{ width: 16, height: 16, accentColor: 'var(--crm-accent)', cursor: 'pointer' }} />
                  Sales
                </label>
                <label className="crm-flex" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.roles.includes('technical')} onChange={() => toggleRole('technical')} style={{ width: 16, height: 16, accentColor: 'var(--crm-accent)', cursor: 'pointer' }} />
                  Technical
                </label>
              </div>
            </div>
          </div>

          <div className="crm-modal-footer">
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary" disabled={loading || !form.name.trim() || !form.email.trim()}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
