/**
 * Unit tests for TicketCard's optional onSelect callback.
 *
 * Targets uncovered function in src/components/TicketCard.tsx line 79:
 *   onClick={() => onSelect?.(ticket.id)}
 *
 * The PBT suite does not pass an onSelect prop, so this behaviour was
 * previously unexercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Select me',
  description: 'A ticket used for onSelect testing',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  tags: [],
};

describe('TicketCard - onSelect behaviour', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
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

  it('does not throw when the title is clicked without an onSelect prop', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      // The ?.() call should short-circuit and simply do nothing.
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('renders the title with pointer cursor and underline when onSelect is provided', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
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
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('calls onSelect once per click across multiple clicks', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      fireEvent.click(title);
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(3);
      expect(onSelect.mock.calls.every(call => call[0] === 'TICKET-9999')).toBe(true);
    } finally {
      unmount();
    }
  });
});
