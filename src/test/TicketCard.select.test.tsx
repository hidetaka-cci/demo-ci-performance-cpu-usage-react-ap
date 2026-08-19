import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Selectable ticket title',
  description: 'A ticket to exercise the onSelect callback',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('title click invokes onSelect with the ticket id when onSelect is provided', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('title click is a no-op when onSelect is undefined', () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title has pointer cursor and underline when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('title has default cursor and no underline when onSelect is undefined', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
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
