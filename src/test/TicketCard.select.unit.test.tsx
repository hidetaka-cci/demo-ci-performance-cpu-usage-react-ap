/**
 * Unit tests for TicketCard's onSelect surface.
 *
 * Covers TicketCard.tsx line 79 (`onClick={() => onSelect?.(ticket.id)}`)
 * and the branches around the optional `onSelect` prop, which the PBT
 * suite does not exercise.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  const base: Ticket = {
    id: 'TICKET-4242',
    title: 'A representative title',
    description: 'A representative description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-05-01T12:00:00Z'),
    updatedAt: new Date('2024-05-01T12:00:00Z'),
    assignee: undefined,
    tags: [],
  };
  return { ...base, ...overrides };
}

describe('TicketCard - title click invokes onSelect', () => {
  it('calls onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });

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
    expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
  });

  it('does not throw when onSelect is omitted and the title is clicked', () => {
    const ticket = makeTicket();
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    expect(() =>
      fireEvent.click(within(container).getByTestId('ticket-title'))
    ).not.toThrow();
  });

  it('renders the title with pointer cursor when onSelect is provided', () => {
    const ticket = makeTicket();
    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title.style.cursor).toBe('pointer');
    expect(title.style.textDecoration).toBe('underline');
  });

  it('renders the title with default cursor when onSelect is omitted', () => {
    const ticket = makeTicket();
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title.style.cursor).toBe('default');
    expect(title.style.textDecoration).toBe('none');
  });
});

describe('TicketCard - action buttons still work when onSelect is present', () => {
  it('advance-status button calls onStatusChange with the next status', () => {
    const onStatusChange = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-0007', status: 'open' });

    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('advance-status-button'));

    expect(onStatusChange).toHaveBeenCalledWith('TICKET-0007', 'in_progress');
  });

  it('delete button calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-0009' });

    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
        onSelect={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('delete-button'));

    expect(onDelete).toHaveBeenCalledWith('TICKET-0009');
  });
});
