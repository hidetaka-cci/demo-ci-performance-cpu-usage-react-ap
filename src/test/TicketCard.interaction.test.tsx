import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket title',
  description: 'Test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: ['bug', 'frontend'],
};

describe('TicketCard - click interactions', () => {
  it('clicking the title calls onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('clicking the title does nothing when onSelect is not provided', () => {
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      // Should not throw when onSelect is undefined
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('advance-status button calls onStatusChange with next status', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledOnce();
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
    } finally {
      unmount();
    }
  });

  it('advance-status cycles: in_progress → resolved', () => {
    const onStatusChange = vi.fn();
    const ticket = { ...baseTicket, status: 'in_progress' as const };
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(ticket.id, 'resolved');
    } finally {
      unmount();
    }
  });

  it('advance-status cycles: resolved → closed', () => {
    const onStatusChange = vi.fn();
    const ticket = { ...baseTicket, status: 'resolved' as const };
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(ticket.id, 'closed');
    } finally {
      unmount();
    }
  });

  it('advance-status cycles: closed → open', () => {
    const onStatusChange = vi.fn();
    const ticket = { ...baseTicket, status: 'closed' as const };
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(ticket.id, 'open');
    } finally {
      unmount();
    }
  });

  it('delete button calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledOnce();
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });
});
