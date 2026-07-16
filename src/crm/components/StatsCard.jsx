export default function StatsCard({ label, value, icon: Icon, color = '#00897b', subtext }) {
  return (
    <div className="crm-stat-card">
      <div className="crm-stat-header">
        <span>{label}</span>
        {Icon && (
          <div className="crm-stat-icon" style={{ background: `${color}18` }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div className="crm-stat-value">{value}</div>
      {subtext && (
        <div className="crm-stat-change" style={{ color }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
