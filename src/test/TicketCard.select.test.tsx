/**
 * TicketCard - onSelect callback tests
 *
 * 既存の TicketCard.pbt.test.tsx は onSelect prop を渡さずにレンダリングしているため、
 * タイトルクリック時の onSelect コールバック分岐がカバーされていない。
 * このテストは onSelect あり／なし両方のパスを補完する。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-0001',
    title: 'Sample ticket',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリック時 onSelect が ticket.id とともに呼ばれる', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />,
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定でもタイトルクリックでクラッシュしない', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />,
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title')),
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect あり: タイトルに underline スタイルが適用される', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.textDecoration).toBe('underline');
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('onSelect なし: タイトルに underline スタイルは適用されない', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />,
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
