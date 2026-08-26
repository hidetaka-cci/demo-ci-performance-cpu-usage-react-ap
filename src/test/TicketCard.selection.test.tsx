/**
 * Coverage-focused tests for TicketCard component.
 *
 * Targets the uncovered onSelect branch (TicketCard.tsx:79):
 *  - onSelect provided → click on title invokes onSelect with the ticket id
 *  - onSelect not provided → click on title is a no-op and does not throw
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-1234',
  title: 'Sample ticket',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: ['sample'],
};

describe('TicketCard - onSelect behavior', () => {
  it('onSelect が渡されている場合、title クリックで onSelect(id) が呼ばれる', () => {
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

  it('onSelect が渡されている場合、title には underline スタイルが付く', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.textDecoration).toBe('underline');
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されていない場合、title クリックしてもエラーにならない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      // クリックしても何も起こらず、例外も発生しないこと
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されていない場合、title には underline スタイルが付かない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.textDecoration).toBe('none');
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });

  it('advance-status-button クリックで onStatusChange が正しい次ステータスで呼ばれる', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...sampleTicket, status: 'open' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(sampleTicket.id, 'in_progress');
    } finally {
      unmount();
    }
  });

  it('closed 状態から advance すると open に戻る (循環遷移)', () => {
    const onStatusChange = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...sampleTicket, status: 'closed' }}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledWith(sampleTicket.id, 'open');
    } finally {
      unmount();
    }
  });

  it('delete-button クリックで onDelete が呼ばれる', () => {
    const onDelete = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('tags が空の場合は tag 要素がレンダリングされない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...sampleTicket, tags: [] }}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(within(container).queryAllByTestId('ticket-tag')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('assignee が undefined の場合は assignee 要素がレンダリングされない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={{ ...sampleTicket, assignee: undefined }}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(within(container).queryByTestId('ticket-assignee')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
