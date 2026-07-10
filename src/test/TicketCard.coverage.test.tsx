/**
 * Coverage-focused tests for TicketCard
 *
 * These target the onSelect optional-callback branch on the ticket title
 * (src/components/TicketCard.tsx:79) which the existing PBT suite does not
 * exercise.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'A clickable title',
  description: 'Detail description body',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  assignee: 'Alice',
  tags: ['a', 'b'],
};

describe('TicketCard - title click (onSelect optional)', () => {
  it('onSelect が渡されている場合、タイトルクリックで呼ばれる', () => {
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
      const q = within(container);
      fireEvent.click(q.getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定でもタイトルクリックはクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
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

  it('onSelect が渡されている場合、タイトルは pointer カーソル/underline スタイルになる', () => {
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
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定の場合、タイトルは default カーソルになる', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
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
