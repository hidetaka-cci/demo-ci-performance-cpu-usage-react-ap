/**
 * Deterministic coverage tests for TicketCard.
 *
 * Covers the optional onSelect callback path (TicketCard.tsx line 79) and its
 * absence — both branches of the optional-chaining call on title click.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Sample ticket title',
  description: 'Sample description',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  assignee: 'Carol',
  tags: ['demo'],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking the title invokes onSelect with the ticket id when the prop is provided', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('clicking the title is a no-op when no onSelect prop is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('renders the title with pointer cursor only when onSelect is provided', () => {
    const withCb = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const titleWith = within(withCb.container).getByTestId('ticket-title');
      expect(titleWith.style.cursor).toBe('pointer');
      expect(titleWith.style.textDecoration).toBe('underline');
    } finally {
      withCb.unmount();
    }

    const withoutCb = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleWithout = within(withoutCb.container).getByTestId('ticket-title');
      expect(titleWithout.style.cursor).toBe('default');
      expect(titleWithout.style.textDecoration).toBe('none');
    } finally {
      withoutCb.unmount();
    }
  });
});
