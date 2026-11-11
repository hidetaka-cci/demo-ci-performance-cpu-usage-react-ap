/**
 * Tests for TicketCard onSelect behavior.
 *
 * Covers TicketCard.tsx:79 — the onClick handler body is never invoked in
 * existing PBT tests because those tests render without an onSelect prop.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Sample ticket title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: ['bug'],
};

describe('TicketCard - onSelect', () => {
  it('タイトルをクリックすると onSelect がチケットIDで呼ばれる', () => {
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
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されていないときタイトルクリックはエラーにならない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されているときタイトルのカーソルは pointer になる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title).toHaveStyle({ cursor: 'pointer' });
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定のときタイトルのカーソルは default になる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('異なるチケットIDでも onSelect が正しいIDで呼ばれる', () => {
    const anotherTicket: Ticket = { ...baseTicket, id: 'TICKET-0099' };
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={anotherTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledWith('TICKET-0099');
    } finally {
      unmount();
    }
  });
});
