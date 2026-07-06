/**
 * Example-based tests for TicketCard - the onSelect title callback.
 *
 * Covers TicketCard.tsx line 79: `onClick={() => onSelect?.(ticket.id)}`.
 * The PBT suite never provides an onSelect prop, so this branch is uncovered.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'A card title',
  description: 'A card description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: undefined,
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('calls onSelect with the ticket id when the title is clicked', () => {
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
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-9999');
    } finally {
      unmount();
    }
  });

  it('renders an underlined pointer-cursor title only when onSelect is provided', () => {
    const withSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(withSelect.container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      withSelect.unmount();
    }

    const withoutSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(withoutSelect.container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      withoutSelect.unmount();
    }
  });

  it('does not throw when the title is clicked and onSelect is undefined', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      // The optional chain in `onSelect?.(ticket.id)` should make this a no-op.
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });
});
