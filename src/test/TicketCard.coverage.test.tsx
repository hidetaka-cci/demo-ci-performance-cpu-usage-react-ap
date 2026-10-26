import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const ticket: Ticket = {
  id: 'TICKET-0042',
  title: 'Coverage test ticket',
  description: 'Used to cover the onSelect click path',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('clicking ticket title calls onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} onSelect={onSelect} />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(ticket.id);
    } finally {
      unmount();
    }
  });

  it('ticket title has pointer cursor when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} onSelect={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });
});
