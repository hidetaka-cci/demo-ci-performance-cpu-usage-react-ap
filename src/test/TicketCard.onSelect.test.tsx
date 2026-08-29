/**
 * Additional tests for TicketCard: onSelect callback behavior
 *
 * Covers the title-click → onSelect(ticket.id) path that the existing
 * PBT suite does not exercise (TicketCard.tsx line 79).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-0042',
    title: 'Sample ticket',
    description: 'A sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    assignee: undefined,
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリック時に onSelect が ticket.id で呼ばれる', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it('onSelect が undefined の場合にタイトルをクリックしてもクラッシュしない', () => {
    const ticket = makeTicket();
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      // optional chaining のパスを通す。例外にならなければOK
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されるとタイトルは pointer カーソル + 下線スタイル', () => {
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

  it('onSelect なしの場合はタイトルは default カーソル + 下線なし', () => {
    const ticket = makeTicket();
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('advance ボタン押下時は onSelect ではなく onStatusChange が呼ばれる', () => {
    const ticket = makeTicket({ status: 'open' });
    const onSelect = vi.fn();
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith('TICKET-0042', 'in_progress');
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
