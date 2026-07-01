import { useState } from 'react';

function AuthPage({ currentUser, onLogin, onRegister, onLogout }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (mode === 'register') {
      const result = await onRegister(form);
      setMessage(result.message);
      if (result.ok) {
        setForm({ name: '', email: '', password: '' });
      }
      return;
    }

    const result = await onLogin(form);
    setMessage(result.message);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>{currentUser ? `Welcome back, ${currentUser.name}` : mode === 'login' ? 'Sign in to your helpdesk' : 'Create a new account'}</h2>
        <p>{currentUser ? 'You can open tickets and monitor their progress here.' : 'Register as a user and start submitting support requests.'}</p>
      </div>

      {currentUser ? (
        <div className="stack">
          <button className="btn secondary" onClick={onLogout}>Log out</button>
        </div>
      ) : (
        <>
          <div className="tab-row">
            <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')} type="button">
              Login
            </button>
            <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')} type="button">
              Register
            </button>
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <input
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            )}
            <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <button className="btn primary" type="submit">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </>
      )}

      {message && <div className={message.includes('success') || message.includes('Welcome') ? 'alert success' : 'alert'}>{message}</div>}
    </div>
  );
}

export default AuthPage;
