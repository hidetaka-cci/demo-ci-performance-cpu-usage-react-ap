import { useState } from 'react';
import type { Ticket, Comment, CommentFormData, Priority, Status } from '../types/ticket';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import { sortCommentsByDate } from '../utils/commentUtils';

interface TicketDetailProps {
  ticket: Ticket;
  comments: Comment[];
  onAddComment: (data: CommentFormData) => void;
  onClose: () => void;
}

const priorityColors: Record<Priority, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
};

const statusColors: Record<Status, string> = {
  open: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#10b981',
  closed: '#6b7280',
};

// ── CommentForm ────────────────────────────────────────────────────────────────

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
}

function CommentForm({ onSubmit }: CommentFormProps) {
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    if (!author.trim() || !body.trim()) return;
    onSubmit({ author: author.trim(), body: body.trim() });
    setAuthor('');
    setBody('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  return (
    <div data-testid="comment-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        data-testid="comment-author-input"
        type="text"
        placeholder="Your name"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        style={inputStyle}
      />
      <textarea
        data-testid="comment-body-input"
        placeholder="Write a comment..."
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <button
        data-testid="comment-submit-button"
        onClick={handleSubmit}
        style={{
          alignSelf: 'flex-end',
          padding: '6px 16px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        Add Comment
      </button>
    </div>
  );
}

// ── CommentList ────────────────────────────────────────────────────────────────

interface CommentListProps {
  comments: Comment[];
}

function CommentList({ comments }: CommentListProps) {
  const sorted = sortCommentsByDate(comments);
  return (
    <div data-testid="comment-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sorted.map(comment => (
        <div
          key={comment.id}
          data-testid="comment-item"
          style={{
            padding: '10px 14px',
            background: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong data-testid="comment-author" style={{ fontSize: '13px', color: '#111827' }}>
              {comment.author}
            </strong>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
              {comment.createdAt.toLocaleDateString()}
            </span>
          </div>
          <p data-testid="comment-body" style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>
            {comment.body}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── TicketDetail ───────────────────────────────────────────────────────────────

export function TicketDetail({ ticket, comments, onAddComment, onClose }: TicketDetailProps) {
  return (
    <div
      data-testid="ticket-detail"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{ticket.id}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
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
          <button
            data-testid="detail-close-button"
            onClick={onClose}
            style={{
              marginLeft: '8px',
              padding: '4px 12px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <h2
        data-testid="detail-title"
        style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 700, color: '#111827' }}
      >
        {ticket.title}
      </h2>
      <p
        data-testid="detail-description"
        style={{ margin: '0 0 16px', fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}
      >
        {ticket.description}
      </p>

      {/* Assignee */}
      {ticket.assignee && (
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
          Assignee: <strong data-testid="detail-assignee">{ticket.assignee}</strong>
        </div>
      )}

      {/* Tags */}
      {ticket.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '20px' }}>
          {ticket.tags.map(tag => (
            <span
              key={tag}
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

      {/* Comments section */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600, color: '#111827' }}>
          Comments ({comments.length})
        </h3>
        {comments.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <CommentList comments={comments} />
          </div>
        )}
        <CommentForm onSubmit={onAddComment} />
      </div>
    </div>
  );
}
