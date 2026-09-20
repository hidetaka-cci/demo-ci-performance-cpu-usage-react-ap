/**
 * Coverage-focused tests for TicketCard's optional onSelect callback.
 *
 * TicketCard.pbt.test.tsx never passes onSelect, so the click handler on
 * the title (`onClick={() => onSelect?.(ticket.id)}`) is never invoked.
 * These tests cover both branches: with and without onSelect provided.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'A ticket',
  description: 'Some description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: undefined,
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリック時に onSelect が ticket.id 付きで呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定でもタイトルクリックがエラーにならない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect 指定時はタイトルに pointer カーソルと underline が付く', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('onSelect 未指定時はタイトルに default カーソルが付く', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('advance-status ボタンで nextStatus に応じて onStatusChange が呼ばれる', () => {
    // Cover the status transition mapping for each status.
    const cases: Array<[Ticket['status'], Ticket['status']]> = [
      ['open', 'in_progress'],
      ['in_progress', 'resolved'],
      ['resolved', 'closed'],
      ['closed', 'open'],
    ];
    for (const [current, next] of cases) {
      const onStatusChange = vi.fn();
      const { unmount, container } = render(
        <TicketCard
          ticket={{ ...baseTicket, status: current }}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      try {
        fireEvent.click(within(container).getByTestId('advance-status-button'));
        expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, next);
      } finally {
        unmount();
      }
    }
  });
});
