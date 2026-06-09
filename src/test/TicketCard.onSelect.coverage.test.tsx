/**
 * Targeted coverage tests for TicketCard onSelect / title click.
 *
 * The PBT suite renders TicketCard without an onSelect prop, so the
 * `onSelect?.(ticket.id)` branch on the title click handler is never
 * exercised. These tests cover:
 *   - onSelect is invoked with the ticket id when title is clicked
 *   - The component does not throw when onSelect is undefined
 *   - onStatusChange / onDelete callbacks remain unaffected
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-1234',
    title: 'Demo ticket',
    description: 'Demo description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    tags: ['demo'],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-9999' });
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
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-9999');
    } finally {
      unmount();
    }
  });

  it('does not throw when title is clicked without an onSelect handler', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      // Should be a no-op via the optional chaining (onSelect?.()).
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('title cursor/style reflects whether onSelect is provided', () => {
    const withSelect = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-0001' })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const withoutSelect = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-0002' })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleWith = within(withSelect.container).getByTestId('ticket-title') as HTMLElement;
      const titleWithout = within(withoutSelect.container).getByTestId('ticket-title') as HTMLElement;
      expect(titleWith.style.cursor).toBe('pointer');
      expect(titleWith.style.textDecoration).toBe('underline');
      expect(titleWithout.style.cursor).toBe('default');
      expect(titleWithout.style.textDecoration).toBe('none');
    } finally {
      withSelect.unmount();
      withoutSelect.unmount();
    }
  });

  it('clicking the title does not trigger onStatusChange or onDelete', () => {
    const onSelect = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
