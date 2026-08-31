/**
 * Tests for TicketCard's title-click selection behavior.
 *
 * Targets uncovered TicketCard.tsx line 79 (onClick handler on ticket-title).
 * The existing PBT suite renders TicketCard without passing onSelect,
 * so the onClick path is never exercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample ticket title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - selection interaction', () => {
  it('onSelect が渡されている時、タイトルクリックで ticket.id が渡される', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    fireEvent.click(title);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('onSelect が渡されている時、タイトルはポインタースタイル+下線になる', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title.style.cursor).toBe('pointer');
    expect(title.style.textDecoration).toBe('underline');
  });

  it('onSelect が渡されていない時、タイトルクリックしてもクラッシュしない', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    // クリックで例外が飛ばないこと
    expect(() => fireEvent.click(title)).not.toThrow();
    // デフォルトスタイルが適用される
    expect(title.style.cursor).toBe('default');
    expect(title.style.textDecoration).toBe('none');
  });
});
