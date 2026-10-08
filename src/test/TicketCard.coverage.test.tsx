/**
 * Targeted unit tests for TicketCard uncovered lines.
 *
 * Covers:
 * - Line 79: title `onClick` invoking `onSelect(ticket.id)` when provided.
 *   (PBT suite only renders with onSelect omitted, so the handler was never fired.)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-9001',
  title: 'Sample ticket',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  assignee: 'Alice',
  tags: ['bug'],
  ...overrides,
});

describe('TicketCard - onSelect handler', () => {
  it('title クリックで onSelect が ticket.id 付きで呼ばれる', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket();
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
      expect(onSelect).toHaveBeenCalledWith(ticket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定でも title クリックでクラッシュしない', () => {
    const ticket = makeTicket({ id: 'TICKET-9002' });
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      // optional chaining で no-op になる経路の確認
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect 指定時はタイトルが pointer / underline スタイルを持つ', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket()}
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
});
