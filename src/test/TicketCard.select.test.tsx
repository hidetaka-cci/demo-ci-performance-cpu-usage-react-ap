/**
 * Tests for TicketCard's optional onSelect callback (title click).
 *
 * This covers line 79 (the onClick handler body) which is missed by
 * the PBT suite — TicketCard.pbt.test.tsx verifies presence/rendering
 * but never fires the click on the title element.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Fix login bug',
  description: 'Server returns 500 on bad credentials.',
  priority: 'critical',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  assignee: 'Alice',
  tags: ['bug', 'auth'],
};

describe('TicketCard - onSelect callback', () => {
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

  it('clicking the title without onSelect prop does not throw', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
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

  it('clicking the delete button calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
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

  it('clicking advance-status button calls onStatusChange with ticket id and next status', () => {
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

  it('status cycles correctly: in_progress → resolved', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'in_progress' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'resolved');
    } finally {
      unmount();
    }
  });

  it('status cycles correctly: closed → open', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'closed' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'open');
    } finally {
      unmount();
    }
  });
});
