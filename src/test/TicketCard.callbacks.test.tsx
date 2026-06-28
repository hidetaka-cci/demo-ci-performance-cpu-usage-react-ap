/**
 * Unit tests for TicketCard callbacks and conditional rendering.
 *
 * The existing PBT suite (TicketCard.pbt.test.tsx) verifies rendering only and
 * never fires button events, so onStatusChange/onDelete/onSelect are uncovered
 * outside the slow App integration suite. These tests pin down each callback
 * with concrete fixtures so the component is independently verifiable.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Status, Ticket } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9001',
    title: 'Sample title',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-05-01T00:00:00Z'),
    updatedAt: new Date('2024-05-01T00:00:00Z'),
    assignee: undefined,
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - callbacks', () => {
  it('Delete ボタン押下で onDelete が ticket.id 付きで呼ばれる', () => {
    const onDelete = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const { container, unmount } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it.each<[Status, Status]>([
    ['open', 'in_progress'],
    ['in_progress', 'resolved'],
    ['resolved', 'closed'],
    ['closed', 'open'],
  ])(
    'advance-status ボタン押下で %s → %s に遷移する onStatusChange が呼ばれる',
    (current, next) => {
      const onStatusChange = vi.fn();
      const { container, unmount } = render(
        <TicketCard
          ticket={makeTicket({ id: 'TICKET-5555', status: current })}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      try {
        fireEvent.click(within(container).getByTestId('advance-status-button'));
        expect(onStatusChange).toHaveBeenCalledTimes(1);
        expect(onStatusChange).toHaveBeenCalledWith('TICKET-5555', next);
      } finally {
        unmount();
      }
    }
  );

  it('title クリックで onSelect が ticket.id 付きで呼ばれる', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket({ id: 'TICKET-7777' })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-7777');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定でも title クリックでクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard ticket={makeTicket()} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が指定されると title に underline が付く', () => {
    const withSelect = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const titleWith = within(withSelect.container).getByTestId('ticket-title') as HTMLElement;
      expect(titleWith.style.textDecoration).toBe('underline');
      expect(titleWith.style.cursor).toBe('pointer');
    } finally {
      withSelect.unmount();
    }

    const withoutSelect = render(
      <TicketCard ticket={makeTicket()} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const titleWithout = within(withoutSelect.container).getByTestId(
        'ticket-title'
      ) as HTMLElement;
      expect(titleWithout.style.textDecoration).toBe('none');
      expect(titleWithout.style.cursor).toBe('default');
    } finally {
      withoutSelect.unmount();
    }
  });
});

describe('TicketCard - conditional rendering', () => {
  it('assignee が undefined のときは assignee 要素を描画しない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket({ assignee: undefined })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(within(container).queryByTestId('ticket-assignee')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('tags が空配列のときは tag 要素を1つも描画しない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket({ tags: [] })}
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

  it('priority/status バッジには表示用ラベル文字列が描画される', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={makeTicket({ priority: 'critical', status: 'in_progress' })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(within(container).getByTestId('priority-badge').textContent).toBe('Critical');
      expect(within(container).getByTestId('status-badge').textContent).toBe('In Progress');
    } finally {
      unmount();
    }
  });
});
