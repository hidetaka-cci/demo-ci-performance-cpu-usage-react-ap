import type { Ticket, Status } from '../types/ticket';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
};

const statusColors: Record<string, string> = {
  open: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#10b981',
  closed: '#6b7280',
};

export function TicketCard({ ticket, onStatusChange, onDelete }: TicketCardProps) {
  const nextStatus: Record<string, Status> = {
    open: 'in_progress',
    in_progress: 'resolved',
    resolved: 'closed',
    closed: 'open',
  };

  return (
    <div
      data-testid="ticket-card"
      data-ticket-id={ticket.id}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{ticket.id}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span
            data-testid="priority-badge"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              background: priorityColors[ticket.priority] + '20',
              color: priorityColors[ticket.priority],
            }}
          >
            {getPriorityLabel(ticket.priority)}
          </span>
          <span
            data-testid="status-badge"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              background: statusColors[ticket.status] + '20',
              color: statusColors[ticket.status],
            }}
          >
            {getStatusLabel(ticket.status)}
          </span>
        </div>
      </div>

      <h3
        data-testid="ticket-title"
        style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#111827' }}
      >
        {ticket.title}
      </h3>

      <p
        data-testid="ticket-description"
        style={{ margin: '0 0 10px', fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}
      >
        {ticket.description}
      </p>

      {ticket.assignee && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
          Assignee: <strong data-testid="ticket-assignee">{ticket.assignee}</strong>
        </div>
      )}

      {ticket.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
          {ticket.tags.map(tag => (
            <span
              key={tag}
              data-testid="ticket-tag"
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                background: '#f3f4f6',
                borderRadius: '4px',
                color: '#374151',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
        <button
          data-testid="advance-status-button"
          onClick={() => onStatusChange(ticket.id, nextStatus[ticket.status])}
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          → {getStatusLabel(nextStatus[ticket.status])}
        </button>
        <button
          data-testid="delete-button"
          onClick={() => onDelete(ticket.id)}
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#dc2626',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
