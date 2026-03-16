import { useState } from 'react';
import type { Priority, TicketFormData } from '../types/ticket';

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
}

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.trim().length > 200) errs.title = 'Title must be 200 characters or less';
    if (!description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSubmit({ title, description, priority, assignee: assignee || undefined, tags });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '4px',
    color: '#374151',
  };

  return (
    <form
      data-testid="ticket-form"
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      <div>
        <label style={labelStyle} htmlFor="title">Title *</label>
        <input
          id="title"
          data-testid="title-input"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
          placeholder="Enter ticket title"
        />
        {errors.title && (
          <span data-testid="title-error" style={{ fontSize: '12px', color: '#dc2626' }}>{errors.title}</span>
        )}
      </div>

      <div>
        <label style={labelStyle} htmlFor="description">Description *</label>
        <textarea
          id="description"
          data-testid="description-input"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          placeholder="Describe the issue"
        />
        {errors.description && (
          <span data-testid="description-error" style={{ fontSize: '12px', color: '#dc2626' }}>{errors.description}</span>
        )}
      </div>

      <div>
        <label style={labelStyle} htmlFor="priority">Priority</label>
        <select
          id="priority"
          data-testid="priority-select"
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          style={inputStyle}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="assignee">Assignee</label>
        <input
          id="assignee"
          data-testid="assignee-input"
          type="text"
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          style={inputStyle}
          placeholder="Enter assignee name (optional)"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          data-testid="tags-input"
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          style={inputStyle}
          placeholder="e.g. bug, frontend, urgent"
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          data-testid="cancel-button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          data-testid="submit-button"
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Create Ticket
        </button>
      </div>
    </form>
  );
}
