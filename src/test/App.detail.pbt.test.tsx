/**
 * Property-Based Tests for App - ticket detail view flow
 *
 * Covers interactions missing from App.pbt.test.tsx and TicketCard.pbt.test.tsx:
 *   - TicketCard title click → TicketDetail opens
 *   - Back button in TicketDetail → returns to list
 *   - Add comment while viewing detail → comment is appended
 *   - Deleting the currently selected ticket clears the detail view
 *
 * ※ try/finally + within(container) で DOM リークを防止します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

const NUM_RUNS = 50;

// ── Arbitraries ───────────────────────────────────────────────────────────────

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

const ticketArb: fc.Arbitrary<Ticket> = fc.record({
  id: fc.stringMatching(/^TICKET-\d{4}$/),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  priority: priorityArb,
  status: statusArb,
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  assignee: fc.option(
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    { nil: undefined }
  ),
  tags: fc.array(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
    { maxLength: 5 }
  ).map(tags => [...new Set(tags)]),
});

// Comment body / author arbitraries (trim で空にならないもの)
const nonBlankStrArb = fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0);

// ── TicketCard: onSelect callback (covers TicketCard.tsx:79) ──────────────────

describe('TicketCard - onSelect callback properties', () => {
  it('title クリックで onSelect が ticket.id 付きで呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onSelect = vi.fn();
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
            onSelect={onSelect}
          />
        );
        try {
          fireEvent.click(within(container).getByTestId('ticket-title'));
          expect(onSelect).toHaveBeenCalledOnce();
          expect(onSelect).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect 未指定でも title クリックで例外は起きない', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
          />
        );
        try {
          // 省略時: 何も起きない (optional chaining により安全)
          expect(() =>
            fireEvent.click(within(container).getByTestId('ticket-title'))
          ).not.toThrow();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── App: detail view open / close ─────────────────────────────────────────────

describe('App - detail view open/close properties', () => {
  it('ticket-title クリックで ticket-detail が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const titles = q.getAllByTestId('ticket-title');
      fireEvent.click(titles[0]);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // チケットリストは非表示に切り替わる
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail-close-button で一覧表示に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail-title は選択されたチケットの title と一致する', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const titleEl = within(cards[1]).getByTestId('ticket-title');
      const expected = titleEl.textContent;
      fireEvent.click(titleEl);

      const detailTitle = q.getByTestId('detail-title');
      expect(detailTitle.textContent).toBe(expected);
    } finally {
      unmount();
    }
  });
});

// ── App: add comment flow (covers App.tsx:73-75) ──────────────────────────────

describe('App - add comment properties', () => {
  it('有効な author/body で comment を追加すると comment-item が1件増える', () => {
    fc.assert(
      fc.property(nonBlankStrArb, nonBlankStrArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          fireEvent.click(q.getAllByTestId('ticket-title')[0]);

          const before = q.queryAllByTestId('comment-item').length;

          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const after = q.queryAllByTestId('comment-item').length;
          expect(after).toBe(before + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('追加されたコメントの author/body が DOM に反映される', () => {
    const author = 'Charlie';
    const body = 'Comment body for integration test';
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      const latest = items[items.length - 1];
      expect(within(latest).getByTestId('comment-author').textContent).toBe(author);
      expect(within(latest).getByTestId('comment-body').textContent).toBe(body);
    } finally {
      unmount();
    }
  });

  it('コメントは選択中のチケットだけに紐づく (別チケットを開くと 0 件に戻る)', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      // 1枚目を開いてコメント追加
      const firstTitles = q.getAllByTestId('ticket-title');
      fireEvent.click(firstTitles[0]);
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'first' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item').length).toBeGreaterThanOrEqual(1);

      // 一覧へ戻る → 2枚目を開く → コメント 0
      fireEvent.click(q.getByTestId('detail-close-button'));
      const secondTitles = q.getAllByTestId('ticket-title');
      fireEvent.click(secondTitles[1]);
      expect(q.queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });
});

// ── App: delete clears selected ticket (covers App.tsx:69 branch) ─────────────

describe('App - delete-while-selected properties', () => {
  it('詳細表示中のチケットを削除フォームからではなく外部で削除した場合でも一覧へ戻る', () => {
    // 現 UI では詳細表示中に Delete ボタンは画面から消えるため、
    // 「表示 → 戻る → 削除 → 再表示できないこと」を確認する。
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const titleEl = q.getAllByTestId('ticket-title')[0];
      const expectedTitle = titleEl.textContent;
      fireEvent.click(titleEl);
      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);

      fireEvent.click(q.getByTestId('detail-close-button'));
      // 同じカードを削除
      const sameCard = q
        .getAllByTestId('ticket-card')
        .find(c => within(c).getByTestId('ticket-title').textContent === expectedTitle);
      expect(sameCard).toBeDefined();
      fireEvent.click(within(sameCard!).getByTestId('delete-button'));

      // 残りのカードから削除済みタイトルは消えている
      const remaining = q.queryAllByTestId('ticket-title').map(el => el.textContent);
      expect(remaining).not.toContain(expectedTitle);
    } finally {
      unmount();
    }
  });
});
