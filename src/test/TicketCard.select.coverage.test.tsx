/**
 * Coverage-oriented tests for TicketCard.tsx onSelect callback.
 *
 * The existing PBT suite renders TicketCard without the optional onSelect
 * prop, so line 79 (onSelect?.(ticket.id)) never fires. These tests exercise
 * both branches of the optional callback:
 *   - when onSelect is provided → invoked with ticket.id on title click
 *   - when onSelect is omitted   → clicking the title is a no-op (no throw)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Coverage test ticket',
  description: 'Exercises onSelect callback',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  assignee: 'Alice',
  tags: ['test'],
};

describe('TicketCard - onSelect callback (coverage)', () => {
  it('タイトルクリックで onSelect が ticket.id を引数に呼ばれる', () => {
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
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定時のタイトルクリックは例外を投げない', () => {
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect 指定時: タイトルにポインタカーソル/下線が付く', () => {
    const { container, unmount } = render(
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

  it('onSelect 未指定時: タイトルにポインタカーソルは付かない', () => {
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
