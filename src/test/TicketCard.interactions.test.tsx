/**
 * Interaction tests for TicketCard click callbacks.
 *
 * The existing PBT suite validates rendering only (title, badges, tags).
 * This file adds coverage for the three callback props:
 *   - onStatusChange (advance-status-button)
 *   - onDelete       (delete-button)
 *   - onSelect       (clicking the ticket title)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket title',
  description: 'A description for testing',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: undefined,
  tags: [],
};

describe('TicketCard - onDelete callback', () => {
  it('clicking Delete calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    fireEvent.click(within(container).getByTestId('delete-button'));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
  });

  it('clicking Delete does not call onStatusChange', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('delete-button'));
    expect(onStatusChange).not.toHaveBeenCalled();
  });
});

describe('TicketCard - onStatusChange callback (advance-status-button)', () => {
  it('open → in_progress: calls onStatusChange with "in_progress"', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={{ ...baseTicket, status: 'open' }} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
  });

  it('in_progress → resolved: calls onStatusChange with "resolved"', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={{ ...baseTicket, status: 'in_progress' }} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'resolved');
  });

  it('resolved → closed: calls onStatusChange with "closed"', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={{ ...baseTicket, status: 'resolved' }} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'closed');
  });

  it('closed → open: cycles back to "open"', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={{ ...baseTicket, status: 'closed' }} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'open');
  });
});

describe('TicketCard - onSelect callback (ticket title click)', () => {
  it('clicking the ticket title calls onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} onSelect={onSelect} />
    );
    fireEvent.click(within(container).getByTestId('ticket-title'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('when onSelect is omitted, clicking the title does not throw', () => {
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    expect(() => fireEvent.click(within(container).getByTestId('ticket-title'))).not.toThrow();
  });

  it('clicking title does not call onDelete or onStatusChange', () => {
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={onStatusChange} onDelete={onDelete} onSelect={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('ticket-title'));
    expect(onDelete).not.toHaveBeenCalled();
    expect(onStatusChange).not.toHaveBeenCalled();
  });
});
