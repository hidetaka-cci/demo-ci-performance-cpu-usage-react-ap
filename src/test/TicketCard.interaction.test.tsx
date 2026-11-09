import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket title',
  description: 'Test description',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - interaction handlers', () => {
  describe('title click / onSelect', () => {
    it('clicking the title calls onSelect with the ticket id', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <TicketCard
          ticket={baseTicket}
          onStatusChange={vi.fn()}
          onDelete={vi.fn()}
          onSelect={onSelect}
        />
      );
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    });

    it('clicking the title does not throw when onSelect is not provided', () => {
      const { container } = render(
        <TicketCard
          ticket={baseTicket}
          onStatusChange={vi.fn()}
          onDelete={vi.fn()}
        />
      );
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    });

    it('title cursor is pointer when onSelect is provided', () => {
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
  });

  describe('advance-status button', () => {
    it('clicking advance-status calls onStatusChange with ticket id and next status', () => {
      const onStatusChange = vi.fn();
      const { container } = render(
        <TicketCard
          ticket={baseTicket}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
    });

    it('advances status correctly from each state', () => {
      const transitions: Array<{ from: Ticket['status']; to: Ticket['status'] }> = [
        { from: 'open', to: 'in_progress' },
        { from: 'in_progress', to: 'resolved' },
        { from: 'resolved', to: 'closed' },
        { from: 'closed', to: 'open' },
      ];

      transitions.forEach(({ from, to }) => {
        const onStatusChange = vi.fn();
        const { container, unmount } = render(
          <TicketCard
            ticket={{ ...baseTicket, status: from }}
            onStatusChange={onStatusChange}
            onDelete={vi.fn()}
          />
        );
        try {
          fireEvent.click(within(container).getByTestId('advance-status-button'));
          expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, to);
        } finally {
          unmount();
        }
      });
    });
  });

  describe('delete button', () => {
    it('clicking delete calls onDelete with the ticket id', () => {
      const onDelete = vi.fn();
      const { container } = render(
        <TicketCard
          ticket={baseTicket}
          onStatusChange={vi.fn()}
          onDelete={onDelete}
        />
      );
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
    });

    it('onDelete is called exactly once per click', () => {
      const onDelete = vi.fn();
      const { container } = render(
        <TicketCard
          ticket={baseTicket}
          onStatusChange={vi.fn()}
          onDelete={onDelete}
        />
      );
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
