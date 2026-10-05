import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Fix broken login',
  description: 'The login button does nothing on Safari.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: 'Alice',
  tags: ['bug', 'auth'],
};

describe('TicketCard - onSelect callback', () => {
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
    expect(onSelect).toHaveBeenCalledWith('TICKET-0001');
  });

  it('renders a clickable (underlined, pointer-cursor) title when onSelect is provided', () => {
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title).toHaveStyle({ cursor: 'pointer' });
    expect(title).toHaveStyle({ textDecoration: 'underline' });
  });

  it('renders a non-interactive (default-cursor, no underline) title when onSelect is omitted', () => {
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title).toHaveStyle({ cursor: 'default' });
    expect(title).toHaveStyle({ textDecoration: 'none' });
  });

  it('clicking the title when onSelect is omitted does not throw and no callback fires', () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );

    expect(() => {
      fireEvent.click(within(container).getByTestId('ticket-title'));
    }).not.toThrow();

    expect(onStatusChange).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('onSelect fires only on the title, not on description or body clicks', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-description'));
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(within(container).getByTestId('ticket-title'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
