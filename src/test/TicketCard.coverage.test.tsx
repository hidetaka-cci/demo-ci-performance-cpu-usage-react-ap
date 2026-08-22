/**
 * Coverage-focused tests for TicketCard.
 *
 * The existing suite never provides an onSelect callback, so the title
 * click handler (line 79: `onClick={() => onSelect?.(ticket.id)}`) is
 * uncovered along with the "onSelect defined" branch of the cursor/
 * decoration styles.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-0007',
    title: 'Sample ticket',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-02'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect handler', () => {
  it('タイトルクリックで onSelect(id) が呼ばれる', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-0042' });

    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith('TICKET-0042');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定でもタイトルクリックはクラッシュしない', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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

  it('onSelect あり: タイトルは pointer カーソルと underline を持つ', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={makeTicket()}
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

  it('onSelect なし: タイトルは default カーソルで underline を持たない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={makeTicket()}
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

  it('複数回クリックすると onSelect も同じ回数呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-0099' })}
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
      expect(onSelect.mock.calls.every(call => call[0] === 'TICKET-0099')).toBe(true);
    } finally {
      unmount();
    }
  });
});
