/**
 * Coverage tests for TicketCard
 *
 * Target: onSelect click handler on the title element (previously uncovered).
 * These are deterministic unit tests, complementing the property-based suite.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9999',
    title: 'Sample ticket',
    description: 'A ticket used for coverage tests.',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect interaction', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket()}
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
        ticket={makeTicket({ id: 'TICKET-1234' })}
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

  it('renders the title with an underline cursor style only when onSelect is provided', () => {
    const withSelect = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-WITH' })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const withoutSelect = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-WITHOUT' })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    try {
      const titleWith = within(withSelect.container).getByTestId('ticket-title');
      const titleWithout = within(withoutSelect.container).getByTestId('ticket-title');
      expect(titleWith).toHaveStyle({ cursor: 'pointer' });
      expect(titleWithout).toHaveStyle({ cursor: 'default' });
    } finally {
      withSelect.unmount();
      withoutSelect.unmount();
    }
  });
});
