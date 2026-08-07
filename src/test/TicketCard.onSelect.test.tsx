/**
 * Unit tests for TicketCard's onSelect callback behavior.
 *
 * Covers the title-click handler (`onClick={() => onSelect?.(ticket.id)}`)
 * which is not exercised by the existing PBT suite (that suite never
 * supplies an onSelect prop).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample title',
  description: 'Sample description',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  assignee: 'Carol',
  tags: ['ui'],
};

describe('TicketCard - onSelect behavior', () => {
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
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定時にタイトルをクリックしてもクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されているとタイトルは underline スタイルになる', () => {
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
      expect(title.style.textDecoration).toBe('underline');
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定だとタイトルは underline されない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.textDecoration).toBe('none');
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });
});
