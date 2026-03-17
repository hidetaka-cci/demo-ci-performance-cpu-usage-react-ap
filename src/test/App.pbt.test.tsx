/**
 * Property-Based Integration Tests for App component
 *
 * 【最重量テスト】
 * App全体をrenderするため、1回のrender当たり:
 *   - TicketStats, TicketCard×n, フィルタUI が全て DOM 構築される
 *   - フィルタ操作 (fireEvent) で React の再レンダリングも走る
 *
 * numRuns を上げると CPU 負荷が最も顕著に増加するテストファイルです。
 * CircleCI のリソースクラス比較デモにはこのファイルが最も効果的です。
 *
 * 推奨 numRuns:
 *   - デモ標準:  300
 *   - 高負荷:    1000
 *   - 超高負荷:  3000
 *
 * ※ try/finally + within(container) で fast-check シュリンキング中の
 *    DOM リークを防止します。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 500;

// ── Arbitraries ───────────────────────────────────────────────────────────────

const statusFilterArb = fc.constantFrom('', 'open', 'in_progress', 'resolved', 'closed');
const priorityFilterArb = fc.constantFrom('', 'critical', 'high', 'medium', 'low');
const sortByArb = fc.constantFrom('createdAt', 'priority', 'status');
const searchQueryArb = fc.string({ maxLength: 20 });

// ── Rendering properties ──────────────────────────────────────────────────────

describe('App - integration rendering properties', () => {
  it('初期レンダリング: 統計・チケットリスト・コントロールが常に表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.getByTestId('ticket-stats')).toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
          expect(q.getByTestId('search-input')).toBeInTheDocument();
          expect(q.getByTestId('filter-status')).toBeInTheDocument();
          expect(q.getByTestId('filter-priority')).toBeInTheDocument();
          expect(q.getByTestId('sort-by')).toBeInTheDocument();
          expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('初期状態: 初期チケット3件が全て表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const cards = within(container).getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThanOrEqual(3);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── Filter properties ─────────────────────────────────────────────────────────

describe('App - filter interaction properties', () => {
  it('status フィルタ後: 表示されている全カードの status バッジが一致する', () => {
    const statusLabelMap: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    fc.assert(
      fc.property(
        fc.constantFrom('open', 'in_progress', 'resolved', 'closed'),
        (status) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('filter-status'), { target: { value: status } });
            const cards = q.queryAllByTestId('ticket-card');
            cards.forEach(card => {
              const badge = within(card).getByTestId('status-badge');
              expect(badge.textContent).toBe(statusLabelMap[status]);
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority フィルタ後: 表示されている全カードの priority バッジが一致する', () => {
    const priorityLabelMap: Record<string, string> = {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };
    fc.assert(
      fc.property(
        fc.constantFrom('critical', 'high', 'medium', 'low'),
        (priority) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('filter-priority'), { target: { value: priority } });
            const cards = q.queryAllByTestId('ticket-card');
            cards.forEach(card => {
              const badge = within(card).getByTestId('priority-badge');
              expect(badge.textContent).toBe(priorityLabelMap[priority]);
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('フィルタをリセット(空)すると全チケットが復元される', () => {
    fc.assert(
      fc.property(statusFilterArb, priorityFilterArb, (status, priority) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const initialCount = q.getAllByTestId('ticket-card').length;

          fireEvent.change(q.getByTestId('filter-status'), { target: { value: status } });
          fireEvent.change(q.getByTestId('filter-priority'), { target: { value: priority } });
          fireEvent.change(q.getByTestId('filter-status'), { target: { value: '' } });
          fireEvent.change(q.getByTestId('filter-priority'), { target: { value: '' } });

          const afterCount = q.getAllByTestId('ticket-card').length;
          expect(afterCount).toBe(initialCount);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('検索クエリがあっても UI はクラッシュしない', () => {
    fc.assert(
      fc.property(searchQueryArb, (query) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('search-input'), { target: { value: query } });
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── Sort properties ───────────────────────────────────────────────────────────

describe('App - sort interaction properties', () => {
  it('任意のsortByに切り替えてもカード枚数は変わらない', () => {
    fc.assert(
      fc.property(sortByArb, (sortBy) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const before = q.getAllByTestId('ticket-card').length;
          fireEvent.change(q.getByTestId('sort-by'), { target: { value: sortBy } });
          const after = q.getAllByTestId('ticket-card').length;
          expect(after).toBe(before);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── New ticket creation properties ────────────────────────────────────────────

describe('App - ticket creation properties', () => {
  it('New Ticket ボタンでフォームが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-form')).not.toBeInTheDocument();
          fireEvent.click(q.getByTestId('new-ticket-button'));
          expect(q.getByTestId('ticket-form')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('フォームのCancelでフォームが非表示になる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          fireEvent.click(q.getByTestId('new-ticket-button'));
          expect(q.getByTestId('ticket-form')).toBeInTheDocument();
          fireEvent.click(q.getByTestId('cancel-button'));
          expect(q.queryByTestId('ticket-form')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('有効なフォーム送信後: チケット件数が1増える', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (title, desc) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const before = q.getAllByTestId('ticket-card').length;

            fireEvent.click(q.getByTestId('new-ticket-button'));
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));

            const after = q.getAllByTestId('ticket-card').length;
            expect(after).toBe(before + 1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── Delete properties ─────────────────────────────────────────────────────────

describe('App - delete interaction properties', () => {
  it('Deleteボタン押下後: チケット件数が1減る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const before = cards.length;
          if (before === 0) return;

          fireEvent.click(within(cards[0]).getByTestId('delete-button'));
          expect(q.queryAllByTestId('ticket-card').length).toBe(before - 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('全チケットを削除すると empty-state が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          let cards = q.getAllByTestId('ticket-card');
          while (cards.length > 0) {
            fireEvent.click(within(cards[0]).getByTestId('delete-button'));
            cards = q.queryAllByTestId('ticket-card');
          }
          expect(q.getByTestId('empty-state')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── Status advance properties ─────────────────────────────────────────────────

describe('App - status advance properties', () => {
  it('ステータス進行ボタンを押すとそのカードのステータスが変わる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;

          const firstCard = cards[0];
          const beforeStatus = within(firstCard).getByTestId('status-badge').textContent;
          fireEvent.click(within(firstCard).getByTestId('advance-status-button'));

          const updatedCards = q.getAllByTestId('ticket-card');
          const afterStatus = within(updatedCards[0]).getByTestId('status-badge').textContent;
          expect(afterStatus).not.toBe(beforeStatus);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
