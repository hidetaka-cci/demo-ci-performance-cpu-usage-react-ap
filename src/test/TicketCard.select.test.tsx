/**
 * Coverage-focused unit tests for TicketCard onSelect behavior.
 *
 * The existing PBT suite renders TicketCard without an onSelect prop,
 * so the title's onClick handler (TicketCard.tsx:79) is never exercised.
 * These targeted tests exercise both the "onSelect provided" and
 * "onSelect omitted" branches to close the coverage gap.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9999',
    title: 'Sample title',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-02'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリックで onSelect がチケットIDと共に呼ばれる', () => {
    const ticket = makeTicket({ id: 'TICKET-0042' });
    const onSelect = vi.fn();
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
      // onSelect?. のオプショナルチェーンが働き、例外は発生しない
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('タイトル要素は onSelect 提供時に pointer カーソルを持つ', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('タイトル要素は onSelect 未指定時に default カーソルを持つ', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });
});
