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

describe('TicketCard - onSelect callback', () => {
  it('calls onSelect with ticket id when title is clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} onSelect={onSelect} />
    );
    fireEvent.click(within(container).getByTestId('ticket-title'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('does not throw when onSelect is not provided and title is clicked', () => {
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(() => {
      fireEvent.click(within(container).getByTestId('ticket-title'));
    }).not.toThrow();
  });

  it('calls onDelete with ticket id when delete button is clicked', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    fireEvent.click(within(container).getByTestId('delete-button'));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
  });

  it('calls onStatusChange with next status when advance button is clicked', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledOnce();
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
  });

  it('cycles status: in_progress → resolved on advance', () => {
    const onStatusChange = vi.fn();
    const ticket = { ...baseTicket, status: 'in_progress' as const };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(ticket.id, 'resolved');
  });

  it('cycles status: resolved → closed on advance', () => {
    const onStatusChange = vi.fn();
    const ticket = { ...baseTicket, status: 'resolved' as const };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(ticket.id, 'closed');
  });

  it('cycles status: closed → open on advance', () => {
    const onStatusChange = vi.fn();
    const ticket = { ...baseTicket, status: 'closed' as const };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(ticket.id, 'open');
  });
});

describe('TicketCard - rendering edge cases', () => {
  it('does not render assignee section when assignee is undefined', () => {
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(within(container).queryByTestId('ticket-assignee')).not.toBeInTheDocument();
  });

  it('renders assignee when present', () => {
    const ticket = { ...baseTicket, assignee: 'Alice' };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(within(container).getByTestId('ticket-assignee').textContent).toBe('Alice');
  });

  it('does not render tag elements when tags array is empty', () => {
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(within(container).queryAllByTestId('ticket-tag')).toHaveLength(0);
  });

  it('renders correct number of tag elements', () => {
    const ticket = { ...baseTicket, tags: ['bug', 'urgent', 'backend'] };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(within(container).getAllByTestId('ticket-tag')).toHaveLength(3);
  });

  it('shows correct priority label for critical', () => {
    const ticket = { ...baseTicket, priority: 'critical' as const };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(within(container).getByTestId('priority-badge').textContent).toBe('Critical');
  });

  it('shows correct status label for in_progress', () => {
    const ticket = { ...baseTicket, status: 'in_progress' as const };
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(within(container).getByTestId('status-badge').textContent).toBe('In Progress');
  });
});
