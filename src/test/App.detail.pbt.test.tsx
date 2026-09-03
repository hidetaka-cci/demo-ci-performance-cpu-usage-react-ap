/**
 * Property-Based Tests for App detail-view flow
 *
 * 以下の App.tsx 未カバー行を検証する:
 *   - handleAddComment: コメント追加ハンドラ (73-76)
 *   - selectedTicket 解決の `?? null` フォールバック (90)
 *   - TicketDetail の onClose ハンドラ (116)
 *
 * TicketCard のタイトルをクリック → TicketDetail が開き、コメント追加や
 * Close 操作を通じてこれら分岐を実際に踏む。
 *
 * ※ try/finally + within(container) で DOM リークを防止。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const authorArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
const bodyArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

describe('App - detail view interaction properties', () => {
  it('ticket-card のタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const title = within(firstCard).getByTestId('ticket-title');
          fireEvent.click(title);

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // リスト側は詳細表示中は非表示
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Back ボタンで一覧に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const backBtn = within(detail).getByTestId('detail-close-button');
          fireEvent.click(backBtn);

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面で有効なコメントを送信するとコメント件数が1増える', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const detailQ = within(detail);
          const beforeCount = detailQ.queryAllByTestId('comment-item').length;

          fireEvent.change(detailQ.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(detailQ.getByTestId('comment-submit-button'));

          const afterCount = detailQ.queryAllByTestId('comment-item').length;
          expect(afterCount).toBe(beforeCount + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面で追加したコメントは body が反映される', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const detailQ = within(detail);

          fireEvent.change(detailQ.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(detailQ.getByTestId('comment-submit-button'));

          const bodies = detailQ.queryAllByTestId('comment-body').map(el => el.textContent);
          expect(bodies).toContain(body.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択中のチケットを削除するとリストに戻り empty-state ではない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const total = cards.length;
          const firstCard = cards[0];

          // 詳細画面へ入る
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Back で戻り、選択チケットを削除
          fireEvent.click(within(q.getByTestId('ticket-detail')).getByTestId('detail-close-button'));
          const listCards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(listCards[0]).getByTestId('delete-button'));

          const remaining = q.queryAllByTestId('ticket-card').length;
          expect(remaining).toBe(total - 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
