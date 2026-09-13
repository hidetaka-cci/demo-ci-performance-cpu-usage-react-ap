/**
 * Targeted tests for TicketCard.tsx onSelect prop (line 79, uncovered in PBT suite).
 *
 * Covers:
 *   - Clicking the title fires onSelect with the ticket id when onSelect is provided
 *   - When onSelect is omitted, clicking the title does not throw (optional-chaining branch)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Selectable ticket',
  description: 'Ticket used to exercise onSelect handler',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  assignee: 'Alice',
  tags: ['ui'],
};

describe('TicketCard - onSelect callback', () => {
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
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('does not throw when onSelect is undefined and title is clicked', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(titleEl)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('applies pointer cursor + underline styling when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(titleEl.style.cursor).toBe('pointer');
      expect(titleEl.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('applies default cursor + no underline when onSelect is omitted', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(titleEl.style.cursor).toBe('default');
      expect(titleEl.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
