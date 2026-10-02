/**
 * Coverage test for TicketCard.tsx L79:
 *   onClick={() => onSelect?.(ticket.id)}
 *
 * The existing PBT suite never passes onSelect, so the optional-chain call site
 * remains uncovered. These tests exercise both the with-onSelect and
 * without-onSelect branches to lock in the title-click behavior.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Investigate flaky webhook test',
  description: 'The webhook delivery test fails ~5% of the time in CI.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
  assignee: 'Carol',
  tags: ['ci', 'flaky'],
};

describe('TicketCard - title onSelect coverage', () => {
  it('タイトルクリックで onSelect がチケットIDとともに呼ばれる', () => {
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
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が与えられている場合はタイトルがポインタ・下線スタイル', () => {
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

  it('onSelect が未指定の場合はクリックしてもエラーにならずデフォルトスタイル', () => {
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
      // Optional chaining で no-op のはず
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('同じカードを複数回クリックすると onSelect がその回数だけ呼ばれる', () => {
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
      fireEvent.click(title);
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(3);
      expect(onSelect.mock.calls.every(args => args[0] === baseTicket.id)).toBe(true);
    } finally {
      unmount();
    }
  });
});
