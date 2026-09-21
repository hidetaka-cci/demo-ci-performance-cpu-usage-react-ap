/**
 * Unit tests for TicketCard's optional onSelect callback.
 *
 * Covers the onClick handler on the ticket title element (line ~79 of
 * TicketCard.tsx), which invokes onSelect?.(ticket.id) when provided.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Investigate flaky test',
  description: 'The nightly run is flaking intermittently.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  tags: ['test', 'ci'],
};

describe('TicketCard - onSelect title click (coverage)', () => {
  it('calls onSelect with the ticket id when the title is clicked', () => {
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
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('does not throw when the title is clicked without an onSelect prop', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      // The optional chaining in the onClick should treat this as a no-op.
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('applies pointer/underline styles only when onSelect is provided', () => {
    const withSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(withSelect.container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      withSelect.unmount();
    }

    const withoutSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(withoutSelect.container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      withoutSelect.unmount();
    }
  });

  it('does not invoke onSelect when the delete or advance-status buttons are clicked', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
    try {
      const q = within(container);
      fireEvent.click(q.getByTestId('delete-button'));
      fireEvent.click(q.getByTestId('advance-status-button'));

      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
