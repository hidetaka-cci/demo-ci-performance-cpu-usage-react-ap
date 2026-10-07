/**
 * Unit tests for the TicketCard title onClick/onSelect handler.
 *
 * Targets uncovered line in src/components/TicketCard.tsx:
 *   - onClick={() => onSelect?.(ticket.id)} on the title element
 *
 * Also exercises the branch where onSelect is not provided (optional chaining
 * short-circuits) so no crash occurs when the title is clicked.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'A clickable ticket title',
  description: 'Some description text.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: ['sample'],
};

describe('TicketCard - onSelect behavior', () => {
  it('calls onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
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

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('clicking the title without an onSelect prop does not throw', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
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

  it('title has pointer cursor and underline when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
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

  it('title has default cursor and no underline when onSelect is omitted', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
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
