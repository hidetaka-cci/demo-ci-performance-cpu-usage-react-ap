/**
 * Coverage tests for TicketCard.
 *
 * The property-based suite never invokes the onSelect callback path.
 * This suite fills that gap.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Sample ticket',
  description: 'sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  tags: ['a', 'b'],
};

describe('TicketCard - callback coverage', () => {
  it('タイトルクリックで onSelect が ticket.id 付きで呼ばれる', () => {
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

  it('onSelect 未指定でもタイトルクリックでクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('delete ボタンクリックで onDelete が ticket.id 付きで呼ばれる', () => {
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('advance-status ボタンクリックで次ステータスに遷移する', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'open' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
    } finally {
      unmount();
    }
  });

  it('closed → open の巡回にも対応する', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...baseTicket, status: 'closed' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'open');
    } finally {
      unmount();
    }
  });
});
