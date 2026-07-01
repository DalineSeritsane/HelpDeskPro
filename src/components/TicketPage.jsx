import { useMemo, useState } from 'react';

function TicketPage({ currentUser, tickets, onCreateTicket, onReplyTicket, onUpdateTicket, isAdmin, loading }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});

  const visibleTickets = useMemo(() => {
    if (!currentUser) return [];
    return isAdmin ? tickets : tickets.filter((ticket) => ticket.userEmail === currentUser.email);
  }, [currentUser, tickets, isAdmin]);

  const handleCreate = async (event) => {
    event.preventDefault();
    const ticket = await onCreateTicket({ subject, description });
    if (ticket) {
      setSubject('');
      setDescription('');
    }
  };

  const handleReply = (ticketId) => {
    const message = replyDrafts[ticketId] || '';
    if (!message.trim()) return;
    onReplyTicket(ticketId, message);
    setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const handleStatusChange = (ticketId) => {
    const nextStatus = statusDrafts[ticketId] || 'Open';
    onUpdateTicket(ticketId, { status: nextStatus });
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <h2>Submit a support ticket</h2>
          <p>Describe the issue and our AI assistant will respond instantly.</p>
        </div>
        <form className="stack" onSubmit={handleCreate}>
          <input placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
          <textarea placeholder="What do you need help with?" value={description} onChange={(event) => setDescription(event.target.value)} rows="4" required />
          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create ticket'}</button>
        </form>
      </div>

      <div className="card dashboard">
        <div className="card-header">
          <h2>{isAdmin ? 'Admin ticket dashboard' : 'Your tickets'}</h2>
          <p>{isAdmin ? 'Monitor requests, update priorities, and respond manually.' : 'Track your open and resolved tickets here.'}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><strong>{visibleTickets.filter((ticket) => ticket.status === 'Open').length}</strong><span>Open</span></div>
          <div className="stat-card"><strong>{visibleTickets.filter((ticket) => ticket.status === 'In Progress').length}</strong><span>In Progress</span></div>
          <div className="stat-card"><strong>{visibleTickets.filter((ticket) => ticket.status === 'Resolved').length}</strong><span>Resolved</span></div>
        </div>

        <div className="stack">
          {visibleTickets.length === 0 && <p>No tickets yet.</p>}
          {visibleTickets.map((ticket) => (
            <div key={ticket._id || ticket.id} className="ticket-card">
              <div className="ticket-top">
                <div>
                  <strong>{ticket.subject}</strong>
                  <p className="muted">{ticket.description}</p>
                </div>
                <span className={`pill ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
              </div>
              <div className="meta-row">
                <small>Reported by {ticket.userEmail}</small>
                <small>Priority: {ticket.priority || 'Medium'}</small>
              </div>
              <div className="chat-box">
                <div className="bubble ai">{ticket.aiReply}</div>
                {(ticket.replies || []).map((reply, index) => (
                  <div key={`${ticket._id || ticket.id}-${index}`} className={`bubble ${reply.role === 'admin' ? 'admin' : 'user'}`}>
                    <strong>{reply.role === 'admin' ? 'Admin' : 'You'}:</strong> {reply.message}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="stack small">
                  <select value={statusDrafts[ticket._id || ticket.id] || ticket.status} onChange={(event) => setStatusDrafts((prev) => ({ ...prev, [ticket._id || ticket.id]: event.target.value }))}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button className="btn secondary" onClick={() => handleStatusChange(ticket._id || ticket.id)}>Update status</button>
                </div>
              )}

              <div className="stack small">
                <textarea rows="2" placeholder={isAdmin ? 'Type an admin reply' : 'Add a follow-up message'} value={replyDrafts[ticket._id || ticket.id] || ''} onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [ticket._id || ticket.id]: event.target.value }))} />
                <button className="btn primary" onClick={() => handleReply(ticket._id || ticket.id)}>{isAdmin ? 'Send admin reply' : 'Send follow-up'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TicketPage;
