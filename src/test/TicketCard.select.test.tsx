/**
 * Coverage-oriented tests for TicketCard.onSelect.
 *
 * The existing PBT suite never passes an onSelect handler, so the title-click
 * branch (TicketCard.tsx line 79) is never invoked. These tests exercise both
 * the with-handler and without-handler branches.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-0001',
    title: 'Sample title',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect (coverage)', () => {
  it('clicking the title invokes onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-0042' });
    const { unmount, container } = render(
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

  it('clicking the title without an onSelect handler does not throw', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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

  it('title style is underlined when onSelect is provided', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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

  it('title style is default when onSelect is NOT provided', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
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
