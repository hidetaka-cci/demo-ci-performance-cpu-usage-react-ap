/**
 * Coverage tests for TicketCard's onSelect / title-click behavior.
 *
 * Targets uncovered branch in TicketCard.tsx line 79:
 *   onClick={() => onSelect?.(ticket.id)}
 *
 * Existing PBT tests do not pass an `onSelect` prop, so the click handler
 * and the optional-chain call are never exercised.
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

describe('TicketCard - onSelect callback', () => {
  it('タイトルをクリックすると onSelect が ticket.id で呼ばれる', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });

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
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定でもタイトルクリックでクラッシュしない', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    try {
      const title = within(container).getByTestId('ticket-title');
      // Should not throw — optional-chain call short-circuits
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect ありのときタイトルは cursor:pointer/underline スタイルになる', () => {
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
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定のときタイトルは cursor:default/textDecoration:none になる', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
