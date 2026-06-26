/**
 * Coverage-targeted tests for TicketCard's optional onSelect callback.
 *
 * Targets src/components/TicketCard.tsx line 79 — the title-click handler
 * `onClick={() => onSelect?.(ticket.id)}` — which the PBT suite never invokes
 * because it always omits onSelect.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const ticket: Ticket = {
  id: 'TICKET-9001',
  title: 'Sample',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
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
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(ticket.id);
    } finally {
      unmount();
    }
  });

  it('does not throw when the title is clicked and onSelect is omitted', () => {
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('renders the title with pointer cursor + underline when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('renders the title with default cursor and no underline when onSelect is omitted', () => {
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
