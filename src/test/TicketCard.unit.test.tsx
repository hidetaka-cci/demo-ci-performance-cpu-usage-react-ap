/**
 * Unit tests for TicketCard component — onSelect callback
 *
 * Covers the uncovered line in TicketCard.tsx:
 *   - Line 79: onClick={() => onSelect?.(ticket.id)}
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket title',
  description: 'A description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: [],
};

describe('TicketCard - onSelect', () => {
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
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('clicking the ticket title without onSelect does not throw', () => {
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

  it('title cursor is pointer when onSelect is provided', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(titleEl.style.cursor).toBe('pointer');
  });

  it('title cursor is default when onSelect is not provided', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(titleEl.style.cursor).toBe('default');
  });

  it('delete button calls onDelete with ticket id', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
        onSelect={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('delete-button'));

    expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
  });

  it('advance status button calls onStatusChange with ticket id and next status', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'open' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('advance-status-button'));

    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
  });

  it('advance status cycles closed -> open', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'closed' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('advance-status-button'));

    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'open');
  });
});
