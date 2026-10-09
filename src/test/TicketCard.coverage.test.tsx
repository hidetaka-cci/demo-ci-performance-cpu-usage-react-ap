/**
 * Coverage-targeted tests for TicketCard.tsx
 *
 * The existing PBT suite never passes `onSelect` to <TicketCard>, so the
 * title click handler on line 79 (`onClick={() => onSelect?.(ticket.id)}`)
 * and the conditional cursor/underline styles for the title are not
 * exercised. These deterministic tests close that gap.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Example title',
  description: 'Example description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - onSelect behavior', () => {
  it('onSelect が渡されている場合、タイトルクリックで id 付きで呼ばれる', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-9999');
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されている場合、タイトルは pointer カーソルで表示される', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('onSelect が未指定の場合でもタイトルクリックで例外にならない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('onSelect はタイトルクリックごとに毎回呼ばれる', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      fireEvent.click(title);
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(3);
    } finally {
      unmount();
    }
  });

  it('onSelect はタイトルクリックのみで呼ばれ、他ボタンクリックでは呼ばれない', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
    try {
      const q = within(container);
      fireEvent.click(q.getByTestId('delete-button'));
      fireEvent.click(q.getByTestId('advance-status-button'));
      expect(onSelect).not.toHaveBeenCalled();
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
    }
  });
});
