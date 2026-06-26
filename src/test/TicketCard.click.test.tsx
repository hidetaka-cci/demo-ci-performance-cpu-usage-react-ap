import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Status } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Title',
  description: 'Test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - onSelect interaction', () => {
  it('clicking the title calls onSelect with the ticket id', () => {
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

  it('clicking the title without onSelect prop does not throw', () => {
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('clicking delete-button calls onDelete with the ticket id', () => {
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledOnce();
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('clicking advance-status-button calls onStatusChange with the ticket id and next status', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard ticket={baseTicket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledOnce();
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - status advancement cycle', () => {
  const cases: Array<[Status, Status]> = [
    ['open', 'in_progress'],
    ['in_progress', 'resolved'],
    ['resolved', 'closed'],
    ['closed', 'open'],
  ];

  cases.forEach(([current, expected]) => {
    it(`advances ${current} → ${expected}`, () => {
      const onStatusChange = vi.fn();
      const ticket: Ticket = { ...baseTicket, status: current };
      const { container, unmount } = render(
        <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
      );
      try {
        fireEvent.click(within(container).getByTestId('advance-status-button'));
        expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, expected);
      } finally {
        unmount();
      }
    });
  });
});
