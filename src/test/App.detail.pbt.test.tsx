/**
 * Property-Based Tests for App - TicketDetail integration
 *
 * Covers App.tsx uncovered lines:
 *  - 73-75: handleAddComment (requires a selected ticket)
 *  - 90: selected ticket lookup `tickets.find(...) ?? null`
 *  - 116: onClose handler for TicketDetail
 *
 * These branches are only exercised once a ticket is selected via the card
 * title click, which no existing test does.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 20;

const nonEmptyStr = (max: number) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

describe('App - detail view interaction properties', () => {
  it('カードタイトルクリックで TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 詳細ビュー表示中はリスト UI が隠れている
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
          expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の title は選択したチケットの title と一致する', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const target = cards[index];
          const expectedTitle = within(target).getByTestId('ticket-title').textContent;
          fireEvent.click(within(target).getByTestId('ticket-title'));
          const detailTitle = q.getByTestId('detail-title');
          expect(detailTitle.textContent).toBe(expectedTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Close ボタンでリスト表示に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
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

  it('TicketDetail 表示中にコメントを送信するとコメント件数が1増える', () => {
    fc.assert(
      fc.property(nonEmptyStr(20), nonEmptyStr(100), (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

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

  it('空の author/body でコメント送信してもコメントは追加されない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const before = q.queryAllByTestId('comment-item').length;
          // author/body 未入力のまま submit
          fireEvent.click(q.getByTestId('comment-submit-button'));
          const after = q.queryAllByTestId('comment-item').length;
          expect(after).toBe(before);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビュー表示中に対象チケットを他のカードから削除しても UI はクラッシュしない', () => {
    // 削除が selectedTicketId === deleted.id の分岐 (App.tsx 68-69) と
    // selectedTicket の find が undefined を返して null にフォールバックする
    // 分岐 (App.tsx 90) の両方を刺激する。
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const firstTitle = within(firstCard).getByTestId('ticket-title').textContent;
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // 詳細ビューを閉じて、選択したチケットを削除する
          fireEvent.click(q.getByTestId('detail-close-button'));
          const targetCard = q.getAllByTestId('ticket-card').find(
            c => within(c).getByTestId('ticket-title').textContent === firstTitle
          )!;
          fireEvent.click(within(targetCard).getByTestId('delete-button'));

          // 該当チケットは表示されない
          const remainingTitles = q.queryAllByTestId('ticket-title').map(t => t.textContent);
          expect(remainingTitles).not.toContain(firstTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
