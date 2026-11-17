/**
 * Tests for TicketCard interaction callbacks.
 *
 * The existing TicketCard.pbt.test.tsx never provides or fires the optional
 * `onSelect` prop, leaving the title-click handler (f1 / s4) at 0% coverage.
 * These tests cover the onSelect callback path and both cursor/decoration
 * branches that depend on whether onSelect is provided.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket',
  description: 'A test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: ['bug'],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking the ticket title calls onSelect with the ticket id', () => {
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

  it('clicking the title without onSelect does not throw', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        // onSelect intentionally omitted
      />
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('delete button calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
        onSelect={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledOnce();
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('advance status button calls onStatusChange with the next status', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'open' }}
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

  it('advance status cycles all four states correctly', () => {
    const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
    const nextMap = {
      open: 'in_progress',
      in_progress: 'resolved',
      resolved: 'closed',
      closed: 'open',
    } as const;

    statuses.forEach(status => {
      const onStatusChange = vi.fn();
      const { container, unmount } = render(
        <TicketCard
          ticket={{ ...baseTicket, status }}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, nextMap[status]);
      unmount();
    });
  });
});
