import { useState } from 'react';
import { X } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export default function AddLeadModal({ onClose }) {
  const { addLead } = useCrm();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', company: '', city: '', notes: ''
  });
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const result = await addLead(form);
    setLoading(false);
    if (!result.error) onClose();
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h2>Add New Lead</h2>
          <button className="crm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-body">
            <div className="crm-form-group">
              <label>Name *</label>
              <input className="crm-input" placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} autoFocus />
            </div>
            <div className="crm-form-row">
              <div className="crm-form-group">
                <label>Phone</label>
                <input className="crm-input" placeholder="Phone number" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="crm-form-group">
                <label>Email</label>
                <input className="crm-input" type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>
            <div className="crm-form-row">
              <div className="crm-form-group">
                <label>Company</label>
                <input className="crm-input" placeholder="Company name" value={form.company} onChange={e => update('company', e.target.value)} />
              </div>
              <div className="crm-form-group">
                <label>City</label>
                <input className="crm-input" placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} />
              </div>
            </div>
            <div className="crm-form-group">
              <label>Notes</label>
              <textarea className="crm-textarea" placeholder="Any additional notes..." value={form.notes} onChange={e => update('notes', e.target.value)} />
            </div>
          </div>

          <div className="crm-modal-footer">
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary" disabled={loading || !form.name.trim()}>
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
