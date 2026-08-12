/**
 * Targeted tests for TicketCard onSelect behavior
 *
 * Covers TicketCard.tsx line 79: onClick={() => onSelect?.(ticket.id)}
 * — clicking the title fires onSelect with the ticket id, and the click
 *   is safely a no-op when onSelect is not provided.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Sample ticket',
  description: 'A description used for onSelect coverage tests.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - onSelect prop', () => {
  it('タイトルクリックで onSelect(ticket.id) が呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />,
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定でもタイトルクリックはクラッシュしない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されるとタイトルは pointer カーソル/underline スタイルになる', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定のときタイトルは default カーソル/装飾なしになる', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
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
