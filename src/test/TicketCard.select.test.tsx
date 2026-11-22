/**
 * Tests for TicketCard - onSelect interaction
 *
 * Covers previously untested path in TicketCard.tsx:
 *   - Line 79: onClick={() => onSelect?.(ticket.id)) — the onSelect callback
 *
 * All existing tests render TicketCard without onSelect, leaving the
 * optional-chained call never invoked.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Sample ticket',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - onSelect interaction', () => {
  it('onSelect が指定されているときタイトルクリックで onSelect(ticket.id) が呼ばれる', () => {
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

  it('onSelect を省略するとタイトルクリックしてもエラーにならない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(() => fireEvent.click(within(container).getByTestId('ticket-title'))).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('全ステータスのチケットで onSelect が正しい id を受け取る', () => {
    const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
    for (const status of statuses) {
      const onSelect = vi.fn();
      const ticket: Ticket = { ...baseTicket, id: `TICKET-${status}`, status };
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
        expect(onSelect).toHaveBeenCalledWith(ticket.id);
      } finally {
        unmount();
      }
    }
  });

  it('onSelect が指定されているときタイトルにポインターカーソルが付く', () => {
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
      expect(title).toHaveStyle({ cursor: 'pointer' });
    } finally {
      unmount();
    }
  });
});
