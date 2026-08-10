/**
 * Unit tests for TicketCard's optional onSelect callback.
 * Covers the previously uncovered click handler at src/components/TicketCard.tsx:79.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-0099',
    title: 'Investigate flaky test',
    description: 'The pagination test is flaky under load.',
    priority: 'high',
    status: 'open',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-02'),
    assignee: 'Carol',
    tags: ['flaky', 'ci'],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリックで onSelect(ticket.id) が呼ばれる', () => {
    const ticket = makeTicket();
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />,
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(ticket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定でもタイトルクリックで例外を投げない', () => {
    const ticket = makeTicket({ id: 'TICKET-0100' });
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect ありのときはタイトルが underline & pointer カーソルで表示される', () => {
    const ticket = makeTicket({ id: 'TICKET-0101' });
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定のときはタイトルが default カーソルで underline なしになる', () => {
    const ticket = makeTicket({ id: 'TICKET-0102' });
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('Delete/AdvanceStatus クリックでは onSelect は呼ばれない', () => {
    const ticket = makeTicket({ id: 'TICKET-0103' });
    const onSelect = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelect={onSelect}
      />,
    );
    try {
      const q = within(container);
      fireEvent.click(q.getByTestId('advance-status-button'));
      fireEvent.click(q.getByTestId('delete-button'));
      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
