/**
 * Coverage gap test for TicketCard.tsx
 *
 * The PBT suite renders TicketCard without an `onSelect` prop, so the title's
 * onClick (TicketCard.tsx line 79: `onClick={() => onSelect?.(ticket.id)}`)
 * is never invoked. This test renders with onSelect and asserts the click
 * calls it with the ticket id.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample ticket for select coverage',
  description: 'Description body',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  tags: [],
};

describe('TicketCard - onSelect coverage', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
  });

  it('does not throw when onSelect is omitted and the title is clicked', () => {
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // The optional-chained call (`onSelect?.(...)`) must be a no-op rather than throwing.
    expect(() =>
      fireEvent.click(within(container).getByTestId('ticket-title'))
    ).not.toThrow();
  });
});
