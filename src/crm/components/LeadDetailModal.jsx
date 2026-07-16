import { useState, useEffect } from 'react';
import { X, Send, Package, Clock, User, MessageSquare } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { STATUS_LABELS, PACKAGES } from '../utils/constants';
import ForwardModal from './ForwardModal';

export default function LeadDetailModal({ lead, onClose }) {
  const { getActivityLog, updateLead, updateLeadStatus, closeDeal, currentUser, logActivity } = useCrm();
  const [activities, setActivities] = useState([]);
  const [showForward, setShowForward] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [requirements, setRequirements] = useState(lead.requirements || '');
  const [selectedPkg, setSelectedPkg] = useState(lead.package || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [lead.id]);

  const loadActivities = async () => {
    const { data } = await getActivityLog(lead.id);
    setActivities(data || []);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateLead(lead.id, { notes });
    await logActivity(lead.id, 'Notes Updated', `Notes were updated`);
    await loadActivities();
    setSaving(false);
  };

  const handleSaveRequirements = async () => {
    setSaving(true);
    await updateLead(lead.id, { requirements });
    await logActivity(lead.id, 'Requirements Updated', `Requirements were updated`);
    await loadActivities();
    setSaving(false);
  };

  const handleCloseDeal = async () => {
    if (!selectedPkg) return;
    await closeDeal(lead.id, selectedPkg, requirements);
    await loadActivities();
    onClose();
  };

  const handleMarkLost = async () => {
    await updateLeadStatus(lead.id, 'closed-lost');
    onClose();
  };

  const isTechnical = currentUser?.role === 'technical';
  const isAdmin = currentUser?.role === 'admin';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <>
      <div className="crm-modal-overlay" onClick={onClose}>
        <div className="crm-modal crm-modal-lg" onClick={e => e.stopPropagation()}>
          <div className="crm-modal-header">
            <div>
              <h2>{lead.name}</h2>
              <span className={`crm-badge crm-badge-${lead.status}`} style={{ marginTop: 6, display: 'inline-flex' }}>
                {STATUS_LABELS[lead.status]}
              </span>
            </div>
            <button className="crm-modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="crm-modal-body">
            {/* Lead Info Grid */}
            <div className="crm-lead-detail-grid">
              <div className="crm-lead-field">
                <label>Phone</label>
                <span>{lead.phone ? <a href={`tel:${lead.phone}`} style={{ color: 'var(--crm-accent)' }}>{lead.phone}</a> : '—'}</span>
              </div>
              <div className="crm-lead-field">
                <label>Email</label>
                <span>{lead.email ? <a href={`mailto:${lead.email}`} style={{ color: 'var(--crm-accent)' }}>{lead.email}</a> : '—'}</span>
              </div>
              <div className="crm-lead-field">
                <label>Company</label>
                <span>{lead.company || '—'}</span>
              </div>
              <div className="crm-lead-field">
                <label>City</label>
                <span>{lead.city || '—'}</span>
              </div>
              {lead.package && (
                <div className="crm-lead-field">
                  <label>Package</label>
                  <span>{lead.package}</span>
                </div>
              )}
              <div className="crm-lead-field">
                <label>Added On</label>
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="crm-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} /> Notes
              </label>
              <textarea
                className="crm-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
              />
              {notes !== (lead.notes || '') && (
                <button className="crm-btn crm-btn-sm crm-btn-primary" onClick={handleSaveNotes} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  Save Notes
                </button>
              )}
            </div>

            {/* Requirements (for Technical Team) */}
            {(isTechnical || isAdmin) && (
              <div className="crm-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Package size={14} /> Requirements
                </label>
                <textarea
                  className="crm-textarea"
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  placeholder="Client requirements, specifications..."
                />
                {requirements !== (lead.requirements || '') && (
                  <button className="crm-btn crm-btn-sm crm-btn-primary" onClick={handleSaveRequirements} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                    Save Requirements
                  </button>
                )}
              </div>
            )}

            {/* Close Deal Section (for Technical) */}
            {(isTechnical || isAdmin) && lead.status !== 'closed-won' && lead.status !== 'closed-lost' && (
              <div className="crm-card" style={{ marginBottom: 24, background: 'var(--crm-bg-elevated)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={16} /> Close Deal
                </h3>
                <div className="crm-form-group">
                  <label>Select Package</label>
                  <select className="crm-select" value={selectedPkg} onChange={e => setSelectedPkg(e.target.value)}>
                    <option value="">Choose a package...</option>
                    {PACKAGES.map(pkg => (
                      <option key={pkg} value={pkg}>{pkg}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="crm-btn crm-btn-primary" onClick={handleCloseDeal} disabled={!selectedPkg}>
                    Close as Won
                  </button>
                  <button className="crm-btn crm-btn-danger" onClick={handleMarkLost}>
                    Close as Lost
                  </button>
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div className="crm-activity-log">
              <h4>Activity Log</h4>
              {activities.length === 0 ? (
                <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>No activity yet</p>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="crm-activity-item">
                    <div className="crm-activity-dot" style={{ background: 'var(--crm-accent)' }} />
                    <div className="crm-activity-content">
                      <p>
                        <strong>{act.action}</strong>
                        {act.details && ` — ${act.details}`}
                      </p>
                      <time>{formatDate(act.created_at)} · {act.user_name}</time>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="crm-modal-footer">
            {lead.status !== 'closed-won' && lead.status !== 'closed-lost' && (
              <button className="crm-btn crm-btn-secondary" onClick={() => setShowForward(true)}>
                <Send size={14} /> Forward
              </button>
            )}
            <button className="crm-btn crm-btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {showForward && (
        <ForwardModal
          leadId={lead.id}
          onClose={() => { setShowForward(false); onClose(); }}
        />
      )}
    </>
  );
}
