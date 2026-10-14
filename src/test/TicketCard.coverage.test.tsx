/**
 * Coverage-targeted tests for TicketCard.
 *
 * Exercises the title click handler branches (TicketCard.tsx line 79)
 * that the existing property-based tests do not cover:
 *   - clicking the title with onSelect provided → callback invoked
 *   - clicking the title without onSelect → no throw (optional chaining)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Coverage sample',
  description: 'Covers title click handler',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
  tags: [],
};

describe('TicketCard - onSelect handler', () => {
  it('clicking the title invokes onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />,
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('clicking the title without onSelect does not throw', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('title has pointer cursor when onSelect is provided', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('title has default cursor when onSelect is not provided', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });
});
