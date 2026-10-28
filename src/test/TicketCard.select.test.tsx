/**
 * Tests for TicketCard onSelect callback.
 *
 * Targets the uncovered path in TicketCard.tsx line 79:
 *   onClick={() => onSelect?.(ticket.id)
 *
 * The existing PBT tests never pass onSelect, so the optional
 * call is never exercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Sample ticket',
  description: 'A sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
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

  it('clicking the title without onSelect does not throw', () => {
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

  it('title has pointer cursor when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(titleEl).toHaveStyle({ cursor: 'pointer' });
    } finally {
      unmount();
    }
  });

  it('title has default cursor when onSelect is not provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(titleEl).toHaveStyle({ cursor: 'default' });
    } finally {
      unmount();
    }
  });

  it('onSelect is called with each distinct ticket id', () => {
    const ids = ['TICKET-0001', 'TICKET-0002', 'TICKET-0003'];
    ids.forEach(id => {
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
      try {
        fireEvent.click(within(container).getByTestId('ticket-title'));
        expect(onSelect).toHaveBeenCalledWith(id);
      } finally {
        unmount();
      }
    });
  });
});
