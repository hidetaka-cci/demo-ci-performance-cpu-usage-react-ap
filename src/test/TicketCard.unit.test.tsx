import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const BASE_TICKET: Ticket = {
  id: 'TICKET-0001',
  title: 'Fix login bug',
  description: 'Login returns 500 on bad credentials',
  priority: 'critical',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: ['bug', 'auth'],
};

describe('TicketCard - onSelect interaction', () => {
  it('clicking the title calls onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={BASE_TICKET}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    fireEvent.click(within(container).getByTestId('ticket-title'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('TICKET-0001');
  });

  it('clicking the title without onSelect prop does not throw', () => {
    const { container } = render(
      <TicketCard
        ticket={BASE_TICKET}
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
        ticket={BASE_TICKET}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    expect(within(container).getByTestId('ticket-title').style.cursor).toBe('pointer');
  });

  it('title cursor is default when onSelect is not provided', () => {
    const { container } = render(
      <TicketCard
        ticket={BASE_TICKET}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(within(container).getByTestId('ticket-title').style.cursor).toBe('default');
  });

  it('advance-status button calls onStatusChange with the next status', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={{ ...BASE_TICKET, status: 'open' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith('TICKET-0001', 'in_progress');
  });

  it('delete button calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={BASE_TICKET}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(within(container).getByTestId('delete-button'));
    expect(onDelete).toHaveBeenCalledWith('TICKET-0001');
  });

  it('status cycles through all states: open → in_progress → resolved → closed → open', () => {
    const statusTransitions: Array<[string, string]> = [
      ['open', 'in_progress'],
      ['in_progress', 'resolved'],
      ['resolved', 'closed'],
      ['closed', 'open'],
    ];
    for (const [current, next] of statusTransitions) {
      const onStatusChange = vi.fn();
      const { container, unmount } = render(
        <TicketCard
          ticket={{ ...BASE_TICKET, status: current as Ticket['status'] }}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith('TICKET-0001', next);
      unmount();
    }
  });
});
