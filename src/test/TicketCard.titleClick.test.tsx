/**
 * Unit tests for TicketCard title click → onSelect callback.
 *
 * Covers the uncovered onSelect path in src/components/TicketCard.tsx:79
 * and the cursor/textDecoration branches that depend on the presence of
 * the onSelect prop.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Title click coverage ticket',
  description: 'Used to exercise the onSelect handler.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  tags: [],
};

describe('TicketCard - title click', () => {
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
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('renders the title with pointer cursor and underline when onSelect is provided', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLHeadingElement;
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('does not throw when clicked without an onSelect prop (optional callback)', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLHeadingElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });
});
