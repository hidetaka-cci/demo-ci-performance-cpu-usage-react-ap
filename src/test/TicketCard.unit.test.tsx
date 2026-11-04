/**
 * Unit tests for TicketCard interactions.
 *
 * The PBT suite covers rendering properties exhaustively.
 * These tests cover the onSelect callback (line 79 in TicketCard.tsx)
 * which was previously uncovered, plus the button callbacks.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Fix login timeout',
  description: 'Session expires too quickly.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01'),
  tags: ['auth', 'ux'],
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

  it('clicking the ticket title without onSelect prop does not throw', () => {
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(() => fireEvent.click(within(container).getByTestId('ticket-title'))).not.toThrow();
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - button callbacks', () => {
  it('delete button calls onDelete with the ticket id', () => {
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

  it('advance status button calls onStatusChange with next status', () => {
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
      // open → in_progress
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
    } finally {
      unmount();
    }
  });

  it('advance status cycles correctly: closed → open', () => {
    const onStatusChange = vi.fn();
    const closedTicket: Ticket = { ...baseTicket, status: 'closed' };
    const { container, unmount } = render(
      <TicketCard
        ticket={closedTicket}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(closedTicket.id, 'open');
    } finally {
      unmount();
    }
  });
});
