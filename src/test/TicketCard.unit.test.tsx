import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Ticket',
  description: 'A test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - title click behavior', () => {
  it('clicking title without onSelect does not throw (optional chaining no-op)', () => {
    const { container, unmount } = render(
      <TicketCard ticket={sampleTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('clicking title with onSelect calls it with the ticket id', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });
});
