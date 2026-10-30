/**
 * Unit tests for TicketCard - onSelect prop
 *
 * Covers uncovered line in TicketCard.tsx:
 *   - Line 79: onClick={() => onSelect?.(ticket.id)} when onSelect is provided
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-0042',
  title: 'Sample selectable ticket',
  description: 'A ticket used to test the onSelect prop.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01'),
  tags: ['test'],
};

describe('TicketCard - onSelect prop', () => {
  it('onSelect が提供されている場合、タイトルクリックで onSelect がチケットID付きで呼ばれる', () => {
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
      const q = within(container);
      fireEvent.click(q.getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が提供されていない場合、タイトルクリックでもエラーにならない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const q = within(container);
      expect(() => fireEvent.click(q.getByTestId('ticket-title'))).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が提供されている場合、タイトルの cursor が pointer になる', () => {
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
      expect(title).toHaveStyle({ cursor: 'pointer' });
    } finally {
      unmount();
    }
  });

  it('onSelect が提供されていない場合、タイトルの cursor が default になる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title).toHaveStyle({ cursor: 'default' });
    } finally {
      unmount();
    }
  });
});
