/**
 * Unit tests for TicketCard onSelect interaction.
 *
 * Targets uncovered line in TicketCard.tsx:
 *  - Line 79: onClick={() => onSelect?.(ticket.id)) — invoked when onSelect is provided
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Ticket Title',
  description: 'Test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: [],
};

describe('TicketCard - onSelect interaction', () => {
  it('onSelectが提供されているとタイトルクリックでonSelectが呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelectが提供されているとタイトルにpointerカーソルが適用される', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      expect(within(container).getByTestId('ticket-title')).toHaveStyle({ cursor: 'pointer' });
    } finally {
      unmount();
    }
  });

  it('onSelectが未指定のときタイトルクリックしても例外が発生しない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });
});
