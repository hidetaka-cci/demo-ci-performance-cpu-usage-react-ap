import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-0099',
    title: 'Sample ticket',
    description: 'A description for the sample ticket.',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect prop', () => {
  it('clicking the title invokes onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const ticket = buildTicket();
    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(ticket.id);
  });

  it('clicking the title without onSelect does not throw', () => {
    const ticket = buildTicket({ id: 'TICKET-0100' });
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    expect(() =>
      fireEvent.click(within(container).getByTestId('ticket-title'))
    ).not.toThrow();
  });

  it('title carries underline styling only when onSelect is provided', () => {
    const ticket = buildTicket({ id: 'TICKET-0101' });
    const withSelect = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const titleWithSelect = within(withSelect.container).getByTestId('ticket-title');
    expect(titleWithSelect.style.cursor).toBe('pointer');
    expect(titleWithSelect.style.textDecoration).toBe('underline');
    withSelect.unmount();

    const withoutSelect = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    const titleWithoutSelect = within(withoutSelect.container).getByTestId('ticket-title');
    expect(titleWithoutSelect.style.cursor).toBe('default');
    expect(titleWithoutSelect.style.textDecoration).toBe('none');
  });
});
