/**
 * Interaction tests for TicketCard.
 *
 * The existing PBT suite verifies that the advance-status, delete, and
 * (optional) select interactions all *render*, but never that clicking
 * them invokes the supplied callback with the right arguments — including
 * the full open → in_progress → resolved → closed → open status cycle
 * and the optional-onSelect branch (`onSelect?.(...)`).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Status } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9999',
    title: 'Sample ticket',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - delete interaction', () => {
  it('invokes onDelete with the ticket id when the Delete button is clicked', () => {
    const onDelete = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - advance status cycle', () => {
  const cycle: ReadonlyArray<{ from: Status; to: Status }> = [
    { from: 'open', to: 'in_progress' },
    { from: 'in_progress', to: 'resolved' },
    { from: 'resolved', to: 'closed' },
    { from: 'closed', to: 'open' },
  ];

  for (const { from, to } of cycle) {
    it(`advances ${from} → ${to} and calls onStatusChange with that next status`, () => {
      const onStatusChange = vi.fn();
      const ticket = makeTicket({ id: 'TICKET-5555', status: from });
      const { container, unmount } = render(
        <TicketCard
          ticket={ticket}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      try {
        fireEvent.click(within(container).getByTestId('advance-status-button'));
        expect(onStatusChange).toHaveBeenCalledTimes(1);
        expect(onStatusChange).toHaveBeenCalledWith('TICKET-5555', to);
      } finally {
        unmount();
      }
    });
  }
});

describe('TicketCard - onSelect (optional callback)', () => {
  it('invokes onSelect with the ticket id when the title is clicked and onSelect is provided', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-0042' });
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
      expect(onSelect).toHaveBeenCalledWith('TICKET-0042');
    } finally {
      unmount();
    }
  });

  it('does not throw when onSelect is omitted and the title is clicked', () => {
    const ticket = makeTicket();
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      // Should be a no-op rather than a crash.
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - badge text content matches label helpers', () => {
  it('renders the priority label text inside priority-badge', () => {
    const ticket = makeTicket({ priority: 'critical' });
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const badge = within(container).getByTestId('priority-badge');
      expect(badge.textContent).toBe('Critical');
    } finally {
      unmount();
    }
  });

  it('renders the status label text inside status-badge', () => {
    const ticket = makeTicket({ status: 'in_progress' });
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const badge = within(container).getByTestId('status-badge');
      expect(badge.textContent).toBe('In Progress');
    } finally {
      unmount();
    }
  });
});
