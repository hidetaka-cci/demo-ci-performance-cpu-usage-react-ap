import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Fix login bug',
  description: 'Login fails with wrong credentials.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: ['bug', 'auth'],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking the title calls onSelect with the ticket id when onSelect is provided', () => {
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

  it('clicking the title without onSelect does not throw', () => {
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

  it('onSelect is not called when clicking the delete button', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('delete-button'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('onSelect is not called when clicking the advance-status button', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
