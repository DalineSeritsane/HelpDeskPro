import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './components/AuthPage';
import TicketPage from './components/TicketPage';
import AdminDashboard from './components/AdminDashboard';

const ADMIN_EMAIL = 'admin@helpdesk.com';
const API_BASE = 'https://helpdeskpro-xx.onrender.com/api';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('helpdesk-demo-current-user');
    return stored ? JSON.parse(stored) : null;
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('helpdesk-demo-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('helpdesk-demo-current-user');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${API_BASE}/tickets`);
        if (!response.ok) {
          console.error('Failed to fetch tickets:', response.status);
          return;
        }
        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (error) {
        console.error('Failed to load tickets', error);
      }
    };

    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser]);

  const isAdmin = useMemo(() => currentUser?.email === ADMIN_EMAIL || currentUser?.role === 'admin', [currentUser]);

  const handleRegister = async ({ name, email, password }) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.message || 'Registration failed' };
      setCurrentUser(data.user);
      return { ok: true, message: 'Account created successfully. Welcome to HelpDesk.' };
    } catch (error) {
      return { ok: false, message: 'Registration failed' };
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.message || 'Login failed' };
      const loggedInUser = { ...data.user, role: data.user.role || (data.user.email === ADMIN_EMAIL ? 'admin' : 'user') };
      setCurrentUser(loggedInUser);
      return { ok: true, message: `Welcome back, ${loggedInUser.name}!` };
    } catch (error) {
      return { ok: false, message: 'Login failed' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateTicket = async ({ subject, description }) => {
    if (!currentUser) return null;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description, userEmail: currentUser.email })
      });
      const data = await response.json();
      setTickets((prev) => [data.ticket, ...prev]);
      setLoading(false);
      return data.ticket;
    } catch (error) {
      setLoading(false);
      return null;
    }
  };

  const handleReplyTicket = async (ticketId, message) => {
    try {
      const response = await fetch(`${API_BASE}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: isAdmin ? 'admin' : 'user', message })
      });
      const data = await response.json();
      setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? data.ticket : ticket)));
    } catch (error) {
      console.error('Reply failed', error);
    }
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? data.ticket : ticket)));
    } catch (error) {
      console.error('Status update failed', error);
    }
  };

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div>
          <strong>HelpDesk Ticketing</strong>
          <p className="subtle">AI-assisted support center</p>
        </div>
        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          {currentUser ? <button className="btn link" onClick={handleLogout}>Logout</button> : <NavLink to="/login">Login</NavLink>}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<div className="hero"><h1>Support center</h1><p>Register, log in, and submit support requests that receive instant AI responses.</p><NavLink className="btn primary" to="/login">Get started</NavLink></div>} />
        <Route path="/login" element={currentUser ? <Navigate to="/tickets" replace /> : <AuthPage currentUser={currentUser} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout} />} />
        <Route path="/tickets" element={currentUser ? (isAdmin ? <AdminDashboard currentUser={currentUser} tickets={tickets} onReplyTicket={handleReplyTicket} onUpdateTicket={handleUpdateTicket} /> : <TicketPage currentUser={currentUser} tickets={tickets} onCreateTicket={handleCreateTicket} onReplyTicket={handleReplyTicket} onUpdateTicket={handleUpdateTicket} isAdmin={isAdmin} loading={loading} />) : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
