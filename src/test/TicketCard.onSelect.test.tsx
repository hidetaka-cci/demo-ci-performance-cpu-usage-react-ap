/**
 * Unit tests for TicketCard's onSelect callback (title click).
 *
 * Targets uncovered line 79 in src/components/TicketCard.tsx:
 *   onClick={() => onSelect?.(ticket.id)}
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Sample title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-02'),
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('title クリック時に onSelect が ticket.id を引数に呼ばれる', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    await user.click(title);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('onSelect 未指定でタイトルをクリックしても例外にならない', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    await expect(user.click(title)).resolves.toBeUndefined();
  });

  it('onSelect ありのとき title はポインタカーソルになる', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('pointer');
  });

  it('onSelect 未指定のとき title は default カーソルになる', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('default');
  });
});
