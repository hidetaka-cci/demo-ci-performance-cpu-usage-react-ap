/**
 * Tests for TicketCard - onSelect callback behavior.
 *
 * Fills a coverage gap in TicketCard.tsx: existing tests do not pass an
 * `onSelect` prop, so the title's onClick handler is never exercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9001',
    title: 'Sample ticket title',
    description: 'Sample ticket description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect interaction', () => {
  it('タイトルクリックで onSelect が ticket.id 引数で呼ばれる', () => {
    const ticket = buildTicket({ id: 'TICKET-4242' });
    const onSelect = vi.fn();

    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('TICKET-4242');
  });

  it('onSelect が未指定でもタイトルクリックでクラッシュしない', () => {
    const ticket = buildTicket();

    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(() => {
      fireEvent.click(within(container).getByTestId('ticket-title'));
    }).not.toThrow();
  });

  it('onSelect が指定されるとタイトルに underline スタイルと pointer カーソルが設定される', () => {
    const ticket = buildTicket();

    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const titleEl = within(container).getByTestId('ticket-title');
    expect(titleEl.style.cursor).toBe('pointer');
    expect(titleEl.style.textDecoration).toBe('underline');
  });

  it('onSelect 未指定時はタイトルに default カーソルで underline なし', () => {
    const ticket = buildTicket();

    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const titleEl = within(container).getByTestId('ticket-title');
    expect(titleEl.style.cursor).toBe('default');
    expect(titleEl.style.textDecoration).toBe('none');
  });
});
