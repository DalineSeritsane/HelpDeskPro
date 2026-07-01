import { useMemo } from 'react';

function AdminDashboard({ currentUser, tickets, onReplyTicket, onUpdateTicket }) {
  const stats = useMemo(() => ({
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    progress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
    resolved: tickets.filter((ticket) => ticket.status === 'Resolved').length
  }), [tickets]);

  return (
    <div className="stack">
      <div className="card dashboard">
        <div className="card-header">
          <h2>Admin control center</h2>
          <p>Welcome back, {currentUser?.name || 'Admin'}. Manage support requests from one place.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><strong>{stats.open}</strong><span>Open</span></div>
          <div className="stat-card"><strong>{stats.progress}</strong><span>In Progress</span></div>
          <div className="stat-card"><strong>{stats.resolved}</strong><span>Resolved</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Manage tickets</h2>
          <p>Update statuses and send manual replies.</p>
        </div>

        <div className="stack">
          {tickets.length === 0 && <p>No tickets available.</p>}
          {tickets.map((ticket) => (
            <div key={ticket._id || ticket.id} className="ticket-card">
              <div className="ticket-top">
                <div>
                  <strong>{ticket.subject}</strong>
                  <p className="muted">{ticket.description}</p>
                </div>
                <span className={`pill ${String(ticket.status).toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
              </div>
              <div className="meta-row">
                <small>Reported by {ticket.userEmail}</small>
                <small>Priority: {ticket.priority || 'Medium'}</small>
              </div>
              <div className="chat-box">
                <div className="bubble ai">{ticket.aiReply}</div>
                {(ticket.replies || []).map((reply, index) => (
                  <div key={`${ticket._id || ticket.id}-${index}`} className={`bubble ${reply.role === 'admin' ? 'admin' : 'user'}`}>
                    <strong>{reply.role === 'admin' ? 'Admin' : 'User'}:</strong> {reply.message}
                  </div>
                ))}
              </div>

              <div className="stack small">
                <select defaultValue={ticket.status} onChange={(event) => onUpdateTicket(ticket._id || ticket.id, { status: event.target.value })}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <textarea
                  rows="2"
                  placeholder="Send a manual admin reply"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      const message = event.currentTarget.value.trim();
                      if (message) {
                        onReplyTicket(ticket._id || ticket.id, message);
                        event.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button className="btn primary" onClick={(event) => {
                  const textarea = event.currentTarget.previousElementSibling;
                  const message = textarea.value.trim();
                  if (message) {
                    onReplyTicket(ticket._id || ticket.id, message);
                    textarea.value = '';
                  }
                }}>Send reply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
