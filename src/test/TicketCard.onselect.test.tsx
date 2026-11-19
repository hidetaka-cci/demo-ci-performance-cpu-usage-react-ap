import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Ticket',
  description: 'A test ticket description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: ['test'],
};

describe('TicketCard - onSelect callback', () => {
  it('onSelectが渡された場合、タイトルクリックでonSelectが呼ばれる', () => {
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
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelectなしでタイトルをクリックしてもエラーにならない', () => {
    const { container, unmount } = render(
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

  it('異なるチケットIDでonSelectが正しいIDで呼ばれる', () => {
    const ids = ['TICKET-0001', 'TICKET-0002', 'TICKET-0099'];

    ids.forEach(id => {
      const onSelect = vi.fn();
      const ticket = { ...baseTicket, id };
      const { container, unmount } = render(
        <TicketCard
          ticket={ticket}
          onStatusChange={vi.fn()}
          onDelete={vi.fn()}
          onSelect={onSelect}
        />
      );
      try {
        fireEvent.click(within(container).getByTestId('ticket-title'));
        expect(onSelect).toHaveBeenCalledWith(id);
      } finally {
        unmount();
      }
    });
  });
});
