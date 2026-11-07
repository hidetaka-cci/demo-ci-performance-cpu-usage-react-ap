/**
 * Targeted unit tests for coverage gaps across several components.
 *
 * Covers branches not exercised by the existing PBT suite:
 *   - TicketForm: title > 200 characters triggers a validation error
 *   - TicketCard: onSelect callback is called when the title is clicked
 *   - TicketDetail/CommentForm: empty body (with valid author) prevents submission
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import { TicketCard } from '../components/TicketCard';
import { TicketDetail } from '../components/TicketDetail';
import type { Ticket, Comment } from '../types/ticket';

// ── Shared fixtures ───────────────────────────────────────────────────────────

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket',
  description: 'A test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

const baseComment: Comment = {
  id: 'COMMENT-1',
  ticketId: 'TICKET-0001',
  author: 'Alice',
  body: 'First comment',
  createdAt: new Date('2024-01-02'),
};

// ── TicketForm - title too long ───────────────────────────────────────────────

describe('TicketForm - title length validation', () => {
  it('title with exactly 201 characters shows a length error and does not call onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toMatch(/200/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title with exactly 200 characters passes validation and calls onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const maxTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: maxTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].title).toBe(maxTitle);
    } finally {
      unmount();
    }
  });

  it('whitespace-only title shows required error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: '   ' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toMatch(/required/i);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});

// ── TicketCard - onSelect callback ────────────────────────────────────────────

describe('TicketCard - onSelect callback', () => {
  it('clicking the ticket title calls onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const q = within(container);
      fireEvent.click(q.getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('title cursor style is pointer when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title).toHaveStyle({ cursor: 'pointer' });
    } finally {
      unmount();
    }
  });

  it('title cursor style is default when onSelect is not provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title).toHaveStyle({ cursor: 'default' });
    } finally {
      unmount();
    }
  });
});

// ── TicketDetail/CommentForm - empty body prevents submission ─────────────────

describe('TicketDetail - CommentForm empty body validation', () => {
  it('valid author but empty body does not call onAddComment', () => {
    const onAddComment = vi.fn();
    const { container, unmount } = render(
      <TicketDetail
        ticket={baseTicket}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      // body left empty
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('whitespace-only body does not call onAddComment', () => {
    const onAddComment = vi.fn();
    const { container, unmount } = render(
      <TicketDetail
        ticket={baseTicket}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('existing comments are displayed sorted by date', () => {
    const older: Comment = {
      ...baseComment,
      id: 'COMMENT-1',
      body: 'Older comment',
      createdAt: new Date('2024-01-01'),
    };
    const newer: Comment = {
      ...baseComment,
      id: 'COMMENT-2',
      body: 'Newer comment',
      createdAt: new Date('2024-01-10'),
    };
    const { container, unmount } = render(
      <TicketDetail
        ticket={baseTicket}
        comments={[newer, older]}
        onAddComment={vi.fn()}
        onClose={vi.fn()}
      />
    );
    try {
      const items = within(container).getAllByTestId('comment-item');
      expect(items).toHaveLength(2);
      // sorted ascending: older first
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Older comment');
      expect(within(items[1]).getByTestId('comment-body').textContent).toBe('Newer comment');
    } finally {
      unmount();
    }
  });
});

// ── ticketUtils - getPriorityLabel / getStatusLabel direct coverage ────────────

import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';

describe('getPriorityLabel', () => {
  it('returns correct label for each priority', () => {
    expect(getPriorityLabel('low')).toBe('Low');
    expect(getPriorityLabel('medium')).toBe('Medium');
    expect(getPriorityLabel('high')).toBe('High');
    expect(getPriorityLabel('critical')).toBe('Critical');
  });
});

describe('getStatusLabel', () => {
  it('returns correct label for each status', () => {
    expect(getStatusLabel('open')).toBe('Open');
    expect(getStatusLabel('in_progress')).toBe('In Progress');
    expect(getStatusLabel('resolved')).toBe('Resolved');
    expect(getStatusLabel('closed')).toBe('Closed');
  });
});
