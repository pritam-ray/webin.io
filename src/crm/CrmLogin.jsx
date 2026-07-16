import { useState } from 'react';
import { useCrm } from './context/CrmContext';

export default function CrmLogin() {
  const { login } = useCrm();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !pin) {
      setError('Please enter both email and PIN');
      return;
    }
    setLoading(true);
    setError('');

    const result = await login(email, pin);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="crm-login-page">
      <div className="crm-login-card">
        <div className="crm-login-logo">W</div>
        <h1>Webing CRM</h1>
        <p className="subtitle">Internal team management portal</p>

        {error && <div className="crm-login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="crm-form-group">
            <label>Email</label>
            <input
              type="email"
              className="crm-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="crm-form-group">
            <label>PIN / Password</label>
            <input
              type="password"
              className="crm-input"
              placeholder="Enter PIN or Password"
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
          </div>

          <button type="submit" className="crm-btn crm-btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="crm-loading-dot" />
                <span className="crm-loading-dot" />
                <span className="crm-loading-dot" />
              </>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
