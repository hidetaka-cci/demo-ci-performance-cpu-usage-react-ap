/**
 * Focused tests for TicketCard's optional onSelect prop.
 *
 * Covers the previously untested handler on line 79 of TicketCard.tsx:
 *   <h3 onClick={() => onSelect?.(ticket.id)}>
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample ticket for onSelect coverage',
  description: 'This ticket exists to test the onSelect prop.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: 'tester',
  tags: ['test'],
};

describe('TicketCard - onSelect prop', () => {
  it('clicking the title calls onSelect with the ticket id', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    fireEvent.click(title);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
  });

  it('clicking the title does not throw when onSelect is not provided', () => {
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    // Should not throw thanks to optional chaining onSelect?.()
    expect(() => fireEvent.click(title)).not.toThrow();
  });

  it('title is styled as clickable when onSelect is provided', () => {
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('pointer');
    expect(title.style.textDecoration).toBe('underline');
  });

  it('title is not styled as clickable when onSelect is omitted', () => {
    const { container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('default');
    expect(title.style.textDecoration).toBe('none');
  });
});
