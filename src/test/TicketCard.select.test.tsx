/**
 * Coverage-focused tests for TicketCard.tsx
 *
 * Covers the previously uncovered onSelect click handler on the title.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Selectable ticket',
  description: 'A ticket used to exercise the onSelect callback.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking the title invokes onSelect with the ticket id when provided', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('title click is a no-op when onSelect is not provided', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(() => {
      fireEvent.click(within(container).getByTestId('ticket-title'));
    }).not.toThrow();
  });
});
