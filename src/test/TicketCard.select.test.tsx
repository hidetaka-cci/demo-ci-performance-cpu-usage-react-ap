/**
 * Coverage tests for TicketCard - onSelect title click handler.
 *
 * Targets TicketCard.tsx line 79: onClick={() => onSelect?.(ticket.id)}
 * The existing PBT suite renders TicketCard without an onSelect prop, so the
 * click-through path is never exercised.
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect title click', () => {
  it('タイトルをクリックすると onSelect が ticket.id で呼ばれる', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    const titleEl = within(container).getByTestId('ticket-title');
    fireEvent.click(titleEl);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
  });

  it('onSelect 未指定でタイトルをクリックしてもエラーにならない', () => {
    const ticket = makeTicket();
    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const titleEl = within(container).getByTestId('ticket-title');
    // Should not throw when onSelect is undefined (optional chaining)
    expect(() => fireEvent.click(titleEl)).not.toThrow();
  });

  it('onSelect 指定時はタイトルが pointer / underline スタイルになる', () => {
    const { container } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(titleEl.style.cursor).toBe('pointer');
    expect(titleEl.style.textDecoration).toBe('underline');
  });

  it('onSelect 未指定時はタイトルが default / non-underline スタイルになる', () => {
    const { container } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(titleEl.style.cursor).toBe('default');
    expect(titleEl.style.textDecoration).toBe('none');
  });
});
