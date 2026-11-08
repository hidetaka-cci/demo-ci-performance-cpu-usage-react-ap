import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Ticket',
  description: 'A test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - selection via title click', () => {
  it('clicking the title calls onSelect with the ticket id', () => {
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
    expect(onSelect).toHaveBeenCalledWith('TICKET-0001');
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

  it('title has pointer cursor when onSelect is provided', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title).toHaveStyle({ cursor: 'pointer' });
  });

  it('title has default cursor when onSelect is not provided', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title).toHaveStyle({ cursor: 'default' });
  });

  it('each click on the title fires onSelect exactly once', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    const title = within(container).getByTestId('ticket-title');

    fireEvent.click(title);
    fireEvent.click(title);
    fireEvent.click(title);

    expect(onSelect).toHaveBeenCalledTimes(3);
  });
});
