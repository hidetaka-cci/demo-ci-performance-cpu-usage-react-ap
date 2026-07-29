/**
 * Unit tests covering TicketCard's optional onSelect callback.
 *
 * Targets previously uncovered TicketCard.tsx line 79:
 *   onClick={() => onSelect?.(ticket.id)}
 *
 * Also covers the styling branch where `onSelect` is undefined (default cursor,
 * no underline) which is exercised alongside the callback path here.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample ticket',
  description: 'A ticket used to exercise the onSelect callback.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: ['bug'],
};

describe('TicketCard - onSelect', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
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
      expect(onSelect).toHaveBeenCalledWith('TICKET-9999');
    } finally {
      unmount();
    }
  });

  it('does not throw when onSelect is omitted and the title is clicked', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('renders the title with pointer/underline styling only when onSelect is provided', () => {
    const withSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const withTitle = within(withSelect.container).getByTestId('ticket-title') as HTMLElement;
    expect(withTitle.style.cursor).toBe('pointer');
    expect(withTitle.style.textDecoration).toBe('underline');
    withSelect.unmount();

    const withoutSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const withoutTitle = within(withoutSelect.container).getByTestId('ticket-title') as HTMLElement;
    expect(withoutTitle.style.cursor).toBe('default');
    expect(withoutTitle.style.textDecoration).toBe('none');
    withoutSelect.unmount();
  });

  it('clicking other controls does not trigger onSelect', () => {
    const onSelect = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
    try {
      const q = within(container);
      fireEvent.click(q.getByTestId('advance-status-button'));
      fireEvent.click(q.getByTestId('delete-button'));
      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
