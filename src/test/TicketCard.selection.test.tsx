/**
 * TicketCard - onSelect callback coverage
 *
 * The main PBT suite never passes `onSelect`, so the callback branch at
 * TicketCard.tsx line 79 is uncovered. These tests exercise both the
 * "onSelect provided" and "onSelect omitted" cases.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-0999',
  title: 'Sample ticket',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-02'),
  assignee: 'Carol',
  tags: ['x', 'y'],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking the title calls onSelect with the ticket id when onSelect is provided', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      // When onSelect is provided the title becomes interactive.
      expect(title).toHaveStyle({ cursor: 'pointer' });

      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('clicking the title is a no-op when onSelect is omitted', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      // Without onSelect the title stays non-interactive and the click must not throw.
      expect(title).toHaveStyle({ cursor: 'default' });
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });
});
