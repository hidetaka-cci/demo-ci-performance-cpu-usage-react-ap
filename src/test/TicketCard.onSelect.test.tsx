/**
 * Focused unit tests for TicketCard.onSelect (line 79 in TicketCard.tsx).
 *
 * The existing pbt suite never renders TicketCard with an onSelect prop, so
 * the title-click handler is uncovered. These tests verify:
 *   - onSelect is invoked with the ticket id when the title is clicked.
 *   - onSelect is safely optional: clicking the title without a handler does
 *     not throw (covers the `onSelect?.` optional-chaining branch).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-9001',
  title: 'Sample title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
  ...overrides,
});

describe('TicketCard - onSelect handler', () => {
  it('タイトルクリックで onSelect が ticket.id 付きで呼ばれる', () => {
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const onSelect = vi.fn();
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
      expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定でタイトルクリックしても例外にならない', () => {
    const ticket = makeTicket();
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されるとタイトルに pointer カーソルが適用される', () => {
    const ticket = makeTicket();
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
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

  it('onSelect 未指定なら default カーソルが適用される', () => {
    const ticket = makeTicket();
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('複数回タイトルクリックしても onSelect はその都度呼ばれる', () => {
    const ticket = makeTicket({ id: 'TICKET-4242' });
    const onSelect = vi.fn();
    const { container, unmount } = render(
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
      expect(onSelect).toHaveBeenNthCalledWith(1, 'TICKET-4242');
      expect(onSelect).toHaveBeenNthCalledWith(2, 'TICKET-4242');
      expect(onSelect).toHaveBeenNthCalledWith(3, 'TICKET-4242');
    } finally {
      unmount();
    }
  });
});
