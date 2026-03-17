import { useState, useMemo } from 'react';
import type { Ticket, Status, Comment, CommentFormData } from './types/ticket';
import { createTicket, updateTicketStatus, filterTickets, sortTickets, getTicketStats } from './utils/ticketUtils';
import { createComment, addComment, getCommentsByTicket } from './utils/commentUtils';
import { TicketCard } from './components/TicketCard';
import { TicketForm } from './components/TicketForm';
import { TicketStats } from './components/TicketStats';
import { FilterPanel } from './components/FilterPanel';
import { TicketDetail } from './components/TicketDetail';
import type { TicketFormData, Priority } from './types/ticket';

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TICKET-0001',
    title: 'Login page returns 500 on invalid credentials',
    description: 'When a user enters wrong password, the server returns 500 instead of 401.',
    priority: 'critical',
    status: 'open',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    assignee: 'Alice',
    tags: ['bug', 'auth', 'backend'],
  },
  {
    id: 'TICKET-0002',
    title: 'Add dark mode support',
    description: 'Users have requested a dark mode option in the settings panel.',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-12'),
    assignee: 'Bob',
    tags: ['feature', 'ui'],
  },
  {
    id: 'TICKET-0003',
    title: 'Performance degradation on large datasets',
    description: 'Dashboard takes 10+ seconds to load when more than 10,000 records exist.',
    priority: 'high',
    status: 'open',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    tags: ['performance', 'backend'],
  },
];

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleCreate = (data: TicketFormData) => {
    const ticket = createTicket(data);
    setTickets(prev => [ticket, ...prev]);
    setShowForm(false);
  };

  const handleStatusChange = (id: string, status: Status) => {
    setTickets(prev => prev.map(t => t.id === id ? updateTicketStatus(t, status) : t));
  };

  const handleDelete = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    if (selectedTicketId === id) setSelectedTicketId(null);
  };

  const handleAddComment = (data: CommentFormData) => {
    if (!selectedTicketId) return;
    const comment = createComment(selectedTicketId, data);
    setComments(prev => addComment(prev, comment));
  };

  const displayedTickets = useMemo(() => {
    const filtered = filterTickets(tickets, {
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
      search: search || undefined,
    });
    return sortTickets(filtered, sortBy);
  }, [tickets, filterStatus, filterPriority, search, sortBy]);

  const stats = useMemo(() => getTicketStats(tickets), [tickets]);

  const selectedTicket = selectedTicketId
    ? tickets.find(t => t.id === selectedTicketId) ?? null
    : null;

  const selectedComments = selectedTicketId
    ? getCommentsByTicket(comments, selectedTicketId)
    : [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#1e293b', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🎫 Ticket Manager</h1>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>CI Performance Demo</span>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <section style={{ marginBottom: '24px' }}>
          <TicketStats stats={stats} />
        </section>

        {/* Detail view */}
        {selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            comments={selectedComments}
            onAddComment={handleAddComment}
            onClose={() => setSelectedTicketId(null)}
          />
        ) : (
          <>
            {/* Controls */}
            <div style={{ marginBottom: '20px' }}>
              <FilterPanel
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                search={search}
                setSearch={setSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                data-testid="new-ticket-button"
                onClick={() => setShowForm(true)}
                style={{
                  padding: '6px 16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                + New Ticket
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Create New Ticket</h2>
                <TicketForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
              </div>
            )}

            {/* Ticket list */}
            <div data-testid="ticket-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayedTickets.length === 0 ? (
                <div data-testid="empty-state" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                  No tickets found.
                </div>
              ) : (
                displayedTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onSelect={setSelectedTicketId}
                  />
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', fontSize: '13px', color: '#9ca3af', textAlign: 'right' }}>
              Showing {displayedTickets.length} of {tickets.length} tickets
            </div>
          </>
        )}
      </main>
    </div>
  );
}
