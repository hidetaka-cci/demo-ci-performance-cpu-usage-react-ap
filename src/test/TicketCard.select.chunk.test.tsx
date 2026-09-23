/**
 * Coverage-targeted tests for TicketCard onSelect handler.
 *
 * Targets previously-uncovered line in src/components/TicketCard.tsx:
 *   - line 79: onClick={() => onSelect?.(ticket.id)}
 *
 * Also asserts the presentation branch (cursor / textDecoration) that
 * depends on whether onSelect was provided.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-0999',
  title: 'Sample title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-02'),
  assignee: undefined,
  tags: [],
  ...overrides,
});

describe('TicketCard - onSelect handler (coverage)', () => {
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

  it('does not throw and does not invoke other callbacks when onSelect is omitted', () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    try {
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('renders the title as pointer/underlined when onSelect is provided', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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

  it('renders the title as default/non-underlined when onSelect is omitted', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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

  it('clicking the title multiple times fires onSelect once per click with the same id', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-4321' });
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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
      expect(onSelect.mock.calls.every(args => args[0] === 'TICKET-4321')).toBe(true);
    } finally {
      unmount();
    }
  });

  it('clicking delete or advance-status does not trigger onSelect', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const q = within(container);
      fireEvent.click(q.getByTestId('delete-button'));
      fireEvent.click(q.getByTestId('advance-status-button'));
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
