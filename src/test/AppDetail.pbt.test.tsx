/**
 * Property-Based Tests for App detail-view flow
 *
 * App の「チケット選択 → 詳細画面 → コメント追加 → 閉じる」フローをカバー。
 * 既存の App.pbt.test.tsx は一覧側の操作のみで、TicketCard.title クリックや
 * App.handleAddComment / TicketDetail onClose 経由の状態遷移は通っていなかった。
 *
 * App 全体 render は重いため、targeted coverage 目的で numRuns は控えめに設定。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 20;

const authorArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
const bodyArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

describe('App - detail view properties', () => {
  it('チケットタイトルをクリックすると詳細画面が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const titles = q.getAllByTestId('ticket-title');
          fireEvent.click(titles[0]);

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面で表示されるタイトルはクリックしたチケットのタイトルと一致する', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (idx) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const titles = q.getAllByTestId('ticket-title');
          const i = idx % titles.length;
          const expectedTitle = titles[i].textContent;
          fireEvent.click(titles[i]);

          const detailTitle = q.getByTestId('detail-title');
          expect(detailTitle.textContent).toBe(expectedTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面の Back ボタンを押すと一覧に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
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
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面で有効なコメントを送信するとコメント数が1増える', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
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

  it('詳細画面で送信したコメント本文が一覧に表示される', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          fireEvent.click(q.getAllByTestId('ticket-title')[0]);

          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const items = q.getAllByTestId('comment-item');
          const last = items[items.length - 1];
          const bodyEl = within(last).getByTestId('comment-body');
          const authorEl = within(last).getByTestId('comment-author');
          expect(bodyEl.textContent).toBe(body.trim());
          expect(authorEl.textContent).toBe(author.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択中のチケットを削除すると詳細画面が閉じる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const beforeCount = q.getAllByTestId('ticket-card').length;
          fireEvent.click(q.getAllByTestId('ticket-title')[0]);
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // 詳細画面を閉じてから一覧の最初のチケットを削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('delete-button'));

          expect(q.queryAllByTestId('ticket-card').length).toBe(beforeCount - 1);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
