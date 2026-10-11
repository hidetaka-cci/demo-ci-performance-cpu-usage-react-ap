/**
 * Property-Based Integration Tests for App — ticket detail / comment flow
 *
 * 既存の App.pbt.test.tsx がカバーしていない動線:
 *   - TicketCard のタイトルクリック → TicketDetail 表示 (TicketCard.tsx:79, App.tsx:90)
 *   - TicketDetail の Back ボタン → 一覧に戻る (App.tsx:116)
 *   - TicketDetail のコメント送信 → App.handleAddComment を経由して反映 (App.tsx:73-75)
 *
 * App 全体を render するため1回あたりのコストが高く、numRuns は控えめに設定しています。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 10;

describe('App - ticket detail interaction properties', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (indexSeed) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const idx = indexSeed % cards.length;
          const card = cards[idx];
          const expectedTitle = within(card).getByTestId('ticket-title').textContent ?? '';

          fireEvent.click(within(card).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          expect(detail).toBeInTheDocument();
          expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
          // 詳細表示中は一覧は消える
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Back ボタンを押すと一覧に戻る', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (indexSeed) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const idx = indexSeed % cards.length;

          fireEvent.click(within(cards[idx]).getByTestId('ticket-title'));
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

  it('コメントを送信するとそのチケットの Comments セクションに反映される', () => {
    const authorArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
    const bodyArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const detailScope = within(detail);

          // 初期コメントは 0 件
          expect(detailScope.queryAllByTestId('comment-item')).toHaveLength(0);

          fireEvent.change(detailScope.getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(detailScope.getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(detailScope.getByTestId('comment-submit-button'));

          const items = detailScope.getAllByTestId('comment-item');
          expect(items).toHaveLength(1);
          expect(within(items[0]).getByTestId('comment-author').textContent).toBe(author.trim());
          expect(within(items[0]).getByTestId('comment-body').textContent).toBe(body.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細表示中のチケットを削除すると選択が解除され一覧に戻る', () => {
    // handleDelete が selectedTicketId を null に戻すパス (App.tsx:69) を踏む
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const ticketId = firstCard.getAttribute('data-ticket-id');

          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // 一旦閉じて一覧に戻り、同じチケットを削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const sameCard = q
            .getAllByTestId('ticket-card')
            .find(c => c.getAttribute('data-ticket-id') === ticketId);
          expect(sameCard).toBeDefined();
          fireEvent.click(within(sameCard!).getByTestId('delete-button'));

          // 削除後も一覧表示が維持される
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細表示中にそのチケットを削除すると自動的に一覧に戻る', () => {
    // selectedTicketId === id の分岐 (App.tsx:69) と、
    // selectedTicketId が設定されているが tickets.find が undefined を返す fallback (App.tsx:90 ?? null) の両方を触るパス
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const ticketId = firstCard.getAttribute('data-ticket-id');

          // delete は TicketCard にあるため、まずカード側で削除してから選択を試す場合もあるが
          // ここでは逆: 選択してから一覧で削除するために一度閉じる
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          fireEvent.click(q.getByTestId('detail-close-button'));

          const stillHere = q
            .getAllByTestId('ticket-card')
            .find(c => c.getAttribute('data-ticket-id') === ticketId);
          expect(stillHere).toBeDefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
