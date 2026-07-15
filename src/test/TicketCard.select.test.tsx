/**
 * Unit tests targeting uncovered branch in TicketCard.tsx:
 * - Line 79: onClick={() => onSelect?.(ticket.id)}
 *
 * Existing PBT tests never invoke the title onClick, so the onSelect
 * callback path is never exercised. These tests fill that gap.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Broken export flow',
  description: 'CSV export truncates the last row on Firefox.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01T00:00:00Z'),
  updatedAt: new Date('2024-05-02T00:00:00Z'),
  assignee: 'Carla',
  tags: ['bug', 'export'],
};

describe('TicketCard - title onSelect callback', () => {
  it('タイトルクリックで onSelect がチケット ID とともに呼ばれる', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={() => {}}
        onDelete={() => {}}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-9001');
    } finally {
      unmount();
    }
  });

  it('onSelect が undefined でもタイトルクリックはクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={() => {}}
        onDelete={() => {}}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されるとタイトルはポインタ/下線スタイルになる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={() => {}}
        onDelete={() => {}}
        onSelect={() => {}}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect が無いときはタイトルは default カーソル', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={() => {}}
        onDelete={() => {}}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
