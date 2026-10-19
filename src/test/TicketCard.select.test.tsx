/**
 * Tests for TicketCard onSelect callback (line 79).
 *
 * The existing PBT tests never pass the optional `onSelect` prop, so the
 * onClick handler on the ticket title was never exercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Login page returns 500 on invalid credentials',
  description: 'When a user enters wrong password, the server returns 500 instead of 401.',
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

  it('clicking the title with different ticket ids calls onSelect with the correct id', () => {
    const ticketIds = ['TICKET-0001', 'TICKET-0042', 'TICKET-9999'];

    for (const id of ticketIds) {
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
    }
  });

  it('title cursor is pointer when onSelect is provided', () => {
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

  it('title cursor is default when onSelect is not provided', () => {
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

  it('clicking title without onSelect does not throw', () => {
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
});
