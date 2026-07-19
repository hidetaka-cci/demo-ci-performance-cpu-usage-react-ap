/**
 * Unit tests for TicketCard interaction callbacks not exercised by the
 * existing rendering-focused property tests: onSelect (title click),
 * onDelete (delete button), and onStatusChange (advance-status button)
 * including the full status advance cycle.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Status } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-0001',
  title: 'Sample title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  assignee: undefined,
  tags: [],
  ...overrides,
});

describe('TicketCard - onSelect (title click)', () => {
  it('タイトルクリックで onSelect が ticket.id で呼ばれる', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-4242' });
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-4242');
    } finally {
      unmount();
    }
  });

  it('onSelect が undefined でもタイトルクリックはクラッシュしない', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されているとタイトルに underline スタイルが付く', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.textDecoration).toBe('underline');
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されていないとタイトルに default cursor が付く', () => {
    const ticket = makeTicket();
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.textDecoration).toBe('none');
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - onDelete (delete button)', () => {
  it('Delete ボタンクリックで onDelete が ticket.id で呼ばれる', () => {
    const onDelete = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-9999' });
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={onDelete}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('TICKET-9999');
    } finally {
      unmount();
    }
  });
});

describe('TicketCard - onStatusChange (advance-status cycle)', () => {
  const cases: Array<{ from: Status; to: Status }> = [
    { from: 'open', to: 'in_progress' },
    { from: 'in_progress', to: 'resolved' },
    { from: 'resolved', to: 'closed' },
    { from: 'closed', to: 'open' },
  ];

  it.each(cases)(
    '"$from" → "$to" のステータス進行ボタンで onStatusChange が正しく呼ばれる',
    ({ from, to }) => {
      const onStatusChange = vi.fn();
      const ticket = makeTicket({ id: 'TICKET-1234', status: from });
      const { unmount, container } = render(
        <TicketCard
          ticket={ticket}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );
      try {
        fireEvent.click(within(container).getByTestId('advance-status-button'));
        expect(onStatusChange).toHaveBeenCalledTimes(1);
        expect(onStatusChange).toHaveBeenCalledWith('TICKET-1234', to);
      } finally {
        unmount();
      }
    }
  );

  it.each(cases)(
    'advance-status ボタンのラベルは次のステータス "$to" のラベルを表示する',
    ({ from, to }) => {
      const ticket = makeTicket({ status: from });
      const { unmount, container } = render(
        <TicketCard
          ticket={ticket}
          onStatusChange={vi.fn()}
          onDelete={vi.fn()}
        />
      );
      try {
        const button = within(container).getByTestId('advance-status-button');
        const labels: Record<Status, string> = {
          open: 'Open',
          in_progress: 'In Progress',
          resolved: 'Resolved',
          closed: 'Closed',
        };
        expect(button.textContent).toContain(labels[to]);
      } finally {
        unmount();
      }
    }
  );
});

describe('TicketCard - conditional rendering', () => {
  it('タグが空配列の場合はタグコンテナが描画されない', () => {
    const ticket = makeTicket({ tags: [] });
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(within(container).queryAllByTestId('ticket-tag')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('assignee が undefined の場合は assignee 表示がない', () => {
    const ticket = makeTicket({ assignee: undefined });
    const { unmount, container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(within(container).queryByTestId('ticket-assignee')).toBeNull();
    } finally {
      unmount();
    }
  });
});
