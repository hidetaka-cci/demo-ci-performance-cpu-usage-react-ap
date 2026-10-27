import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket title',
  description: 'A description',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: ['bug'],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking ticket title calls onSelect with the ticket id', () => {
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

  it('clicking ticket title without onSelect prop does not throw', () => {
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

  it('onSelect is called with the correct ticket id for each ticket', () => {
    const ticketIds = ['TICKET-0001', 'TICKET-0002', 'TICKET-9999'];
    ticketIds.forEach(id => {
      const onSelect = vi.fn();
      const ticket = { ...baseTicket, id };
      const { container, unmount } = render(
        <TicketCard
          ticket={ticket}
          onStatusChange={vi.fn()}
          onDelete={vi.fn()}
          onSelect={onSelect}
        />
      );
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledWith(id);
      unmount();
    });
  });

  it('onDelete is called with the correct ticket id when Delete is clicked', () => {
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

  it('onStatusChange advances status correctly from open to in_progress', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'open' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
  });

  it('onStatusChange cycles from closed back to open', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'closed' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'open');
  });
});
