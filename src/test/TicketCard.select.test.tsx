/**
 * Tests for TicketCard onSelect click handler
 *
 * Covers the previously untested title-click flow that invokes onSelect
 * with the ticket id, and confirms that omitting onSelect is safe.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-1234',
  title: 'Fix header alignment',
  description: 'Header wraps on narrow viewports.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: 'Alice',
  tags: ['ui'],
};

describe('TicketCard - onSelect click behavior', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
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
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('title shows pointer cursor and underline when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('title shows default cursor and no underline when onSelect is omitted', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('multiple clicks call onSelect once per click', () => {
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
      fireEvent.click(title);
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(3);
      for (const call of onSelect.mock.calls) {
        expect(call[0]).toBe(baseTicket.id);
      }
    } finally {
      unmount();
    }
  });
});
