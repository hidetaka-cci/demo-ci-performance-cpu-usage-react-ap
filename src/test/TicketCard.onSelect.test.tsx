/**
 * Unit tests for TicketCard's onSelect interaction.
 *
 * Covers the optional onSelect handler branch (TicketCard.tsx line 79)
 * which the property-based suite does not exercise.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Sample ticket',
  description: 'A description that should render in the card.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  tags: [],
};

describe('TicketCard - onSelect', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('TICKET-9001');
  });

  it('does not throw when onSelect is omitted and the title is clicked', () => {
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    expect(() =>
      fireEvent.click(within(container).getByTestId('ticket-title'))
    ).not.toThrow();
  });

  it('renders the title as a clickable element when onSelect is provided', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('pointer');
    expect(title.style.textDecoration).toBe('underline');
  });

  it('renders the title as a non-clickable element when onSelect is omitted', () => {
    const { container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('default');
    expect(title.style.textDecoration).toBe('none');
  });
});
