/**
 * Example-based tests for TicketCard.onSelect
 *
 * These tests cover the title-click handler on TicketCard (`onSelect` prop),
 * which is not exercised by the existing property-based rendering tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Sample ticket title',
  description: 'Sample description body',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  assignee: 'Chunk',
  tags: ['bug', 'ui'],
};

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリックで onSelect が ticket.id で呼ばれる', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />,
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      fireEvent.click(titleEl);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されていない場合でもタイトルクリックはクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(titleEl)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されているとタイトルスタイルが underline / pointer になる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(titleEl.style.cursor).toBe('pointer');
      expect(titleEl.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect が省略されるとタイトルスタイルは default / none になる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(titleEl.style.cursor).toBe('default');
      expect(titleEl.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
