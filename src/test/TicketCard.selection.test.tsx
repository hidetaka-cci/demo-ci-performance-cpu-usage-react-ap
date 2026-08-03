/**
 * Coverage tests for TicketCard.tsx click-to-select behavior
 *
 * Covers TicketCard.tsx line 79 (onClick={() => onSelect?.(ticket.id)}),
 * which is not exercised by the existing PBT suite that only passes
 * onStatusChange / onDelete callbacks.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-4242',
  title: 'Sample ticket',
  description: 'A ticket description for testing.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-02'),
  assignee: 'Alice',
  tags: ['tag-one'],
};

describe('TicketCard - onSelect behavior', () => {
  it('タイトルをクリックすると onSelect がチケット ID とともに呼ばれる', () => {
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
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が省略された場合でもタイトルクリックはエラーにならない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('onSelect が指定されている場合、タイトルは pointer カーソルと下線スタイルを持つ', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect が省略されている場合、タイトルの cursor は default になる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('onStatusChange と onDelete は onSelect と独立に呼ばれる', () => {
    const onSelect = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
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
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
