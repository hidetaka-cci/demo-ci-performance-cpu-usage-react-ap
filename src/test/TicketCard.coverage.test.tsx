/**
 * Coverage tests for TicketCard interaction callbacks that the existing PBT
 * suite does not exercise:
 *   - `onSelect`       (title click, TicketCard.tsx:79)
 *   - `onStatusChange` (advance-status click, TicketCard.tsx:125)
 *   - `onDelete`       (delete click, TicketCard.tsx:139)
 *
 * The PBT tests only assert that the buttons render, never that clicking them
 * invokes the corresponding callback with the expected arguments.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Status } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Sample ticket',
  description: 'Some description',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  tags: [],
};

function renderCard(overrides: Partial<Ticket> = {}, callbacks: {
  onStatusChange?: ReturnType<typeof vi.fn>;
  onDelete?: ReturnType<typeof vi.fn>;
  onSelect?: ReturnType<typeof vi.fn>;
} = {}) {
  const ticket: Ticket = { ...baseTicket, ...overrides };
  const onStatusChange = callbacks.onStatusChange ?? vi.fn();
  const onDelete = callbacks.onDelete ?? vi.fn();
  const onSelect = callbacks.onSelect;
  const result = render(
    <TicketCard
      ticket={ticket}
      onStatusChange={onStatusChange}
      onDelete={onDelete}
      onSelect={onSelect}
    />
  );
  return {
    ...result,
    q: within(result.container),
    ticket,
    onStatusChange,
    onDelete,
    onSelect,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('calls onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const { unmount, q, ticket } = renderCard({}, { onSelect });
    try {
      fireEvent.click(q.getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(ticket.id);
    } finally {
      unmount();
    }
  });

  it('does not throw when onSelect is undefined and the title is clicked', () => {
    const { unmount, q } = renderCard({}, {});
    try {
      // No onSelect provided — clicking should be a safe no-op.
      expect(() => fireEvent.click(q.getByTestId('ticket-title'))).not.toThrow();
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - advance-status button', () => {
  const transitions: Array<[Status, Status]> = [
    ['open', 'in_progress'],
    ['in_progress', 'resolved'],
    ['resolved', 'closed'],
    ['closed', 'open'],
  ];

  it.each(transitions)('advances %s -> %s when the advance-status button is clicked', (from, to) => {
    const onStatusChange = vi.fn();
    const { unmount, q, ticket } = renderCard({ status: from }, { onStatusChange });
    try {
      fireEvent.click(q.getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith(ticket.id, to);
    } finally {
      unmount();
    }
  });

  it('button label shows the label of the next status', () => {
    const { unmount, q } = renderCard({ status: 'in_progress' });
    try {
      const button = q.getByTestId('advance-status-button');
      // Next status after in_progress is resolved.
      expect(button.textContent).toContain('Resolved');
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - delete button', () => {
  it('calls onDelete with the ticket id when the delete button is clicked', () => {
    const onDelete = vi.fn();
    const { unmount, q, ticket } = renderCard({}, { onDelete });
    try {
      fireEvent.click(q.getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(ticket.id);
    } finally {
      unmount();
    }
  });

  it('does not call onStatusChange when only delete is clicked', () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { unmount, q } = renderCard({}, { onStatusChange, onDelete });
    try {
      fireEvent.click(q.getByTestId('delete-button'));
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onDelete).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
    }
  });
});
