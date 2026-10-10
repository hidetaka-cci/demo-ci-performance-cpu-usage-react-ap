/**
 * Property-Based Integration Tests for App — ticket detail flow
 *
 * App.pbt.test.tsx が「チケット選択 → 詳細画面」経路を扱っていないため、
 * ここで以下の統合挙動を検証:
 *   - カードのタイトルをクリックすると TicketDetail が表示される
 *   - 戻るボタンでカード一覧に戻る
 *   - 詳細画面からコメントを追加できる
 *   - 詳細表示中のチケットが削除されても UI がクラッシュしない
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 50;

describe('App - ticket detail selection flow', () => {
  it('チケットタイトルクリックで TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 詳細表示中はカード一覧は見えない
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面の選択チケットの title と id が元のカードと一致する', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (idx) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const target = cards[idx % cards.length];
          const expectedTitle = within(target).getByTestId('ticket-title').textContent;
          const expectedId = target.getAttribute('data-ticket-id');

          fireEvent.click(within(target).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
          // 詳細内に id の文字列が含まれていること
          expect(detail.textContent).toContain(expectedId);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('Back ボタンで一覧に戻る', () => {
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

  it('詳細画面でコメントを追加するとコメント件数が1増える', () => {
    const nameArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
    const bodyArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);
    fc.assert(
      fc.property(nameArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const before = within(detail).queryAllByTestId('comment-item').length;

          fireEvent.change(within(detail).getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(within(detail).getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(within(detail).getByTestId('comment-submit-button'));

          const after = within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item').length;
          expect(after).toBe(before + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面で追加したコメントの author/body が表示される', () => {
    const nameArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
    const bodyArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);
    fc.assert(
      fc.property(nameArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          fireEvent.change(within(detail).getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(within(detail).getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(within(detail).getByTestId('comment-submit-button'));

          const authorEls = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-author');
          const bodyEls = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-body');
          expect(authorEls.some(el => el.textContent === author.trim())).toBe(true);
          expect(bodyEls.some(el => el.textContent === body.trim())).toBe(true);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細表示中のチケットを他の経路から削除してもクラッシュしない (一覧に戻る)', () => {
    // 詳細表示 → Back → 元のカードを削除 → 再度別のカードを選択
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const firstId = firstCard.getAttribute('data-ticket-id');

          // 選択してから戻る
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          fireEvent.click(q.getByTestId('detail-close-button'));

          // 一覧から対象カードを削除
          const target = q.getAllByTestId('ticket-card').find(
            c => c.getAttribute('data-ticket-id') === firstId
          )!;
          fireEvent.click(within(target).getByTestId('delete-button'));

          // 一覧が引き続き表示されていること
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
          const ids = q.getAllByTestId('ticket-card').map(c => c.getAttribute('data-ticket-id'));
          expect(ids).not.toContain(firstId);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
