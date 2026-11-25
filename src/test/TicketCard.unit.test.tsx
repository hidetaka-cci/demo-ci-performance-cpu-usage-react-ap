/**
 * Unit tests for TicketCard's onSelect interaction.
 *
 * The PBT suite renders TicketCard without an onSelect prop and never fires
 * a click event on the ticket title, leaving this uncovered:
 *   - TicketCard.tsx line 79: onClick={() => onSelect?.(ticket.id)}
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Fix login bug',
  description: 'Login fails on bad creds',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  tags: ['bug', 'auth'],
};

describe('TicketCard - onSelect interaction', () => {
  it('clicking the ticket title calls onSelect with the ticket id', () => {
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

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('TICKET-0042');
  });

  it('clicking the ticket title without onSelect does not throw', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(() =>
      fireEvent.click(within(container).getByTestId('ticket-title'))
    ).not.toThrow();
  });

  it('delete button calls onDelete with ticket id, not onSelect', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('delete-button'));

    expect(onDelete).toHaveBeenCalledWith('TICKET-0042');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('advance status button calls onStatusChange with correct next status', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'open' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('advance-status-button'));

    expect(onStatusChange).toHaveBeenCalledWith('TICKET-0042', 'in_progress');
  });
});
