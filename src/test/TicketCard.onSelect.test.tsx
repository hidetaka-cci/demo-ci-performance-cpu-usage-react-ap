/**
 * Coverage tests for TicketCard.tsx onSelect callback (uncovered line 79).
 *
 * The existing PBT suite renders TicketCard without an `onSelect` prop, so
 * the lambda `() => onSelect?.(ticket.id)` body is never invoked. These
 * tests provide the prop and click the title to cover the branch.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9001',
    title: 'Sample title',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-02'),
    tags: ['ui'],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback coverage', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const { unmount, container } = render(
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
      expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it('renders the title as an interactive element when onSelect is provided', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('does not throw when the title is clicked without onSelect', () => {
    // onSelect?.() should short-circuit safely
    const { unmount, container } = render(
      <TicketCard ticket={makeTicket()} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
      expect((title as HTMLElement).style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });

  it('fires onSelect once per click and does not trigger status/delete handlers', () => {
    const onSelect = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-7777' })}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      fireEvent.click(title);
      fireEvent.click(title);

      expect(onSelect).toHaveBeenCalledTimes(3);
      expect(onSelect.mock.calls.every(([id]) => id === 'TICKET-7777')).toBe(true);
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
