/**
 * Property-Based Integration Tests for App - delete-after-detail flow
 *
 * 既存の App.pbt.test.tsx の delete テストは「一覧から直接 Delete」だけを扱い、
 * 「詳細表示 → 一覧へ戻る → Delete」という往復後の delete 経路は触れていない。
 *
 * 注意: src/App.tsx:69 の `if (selectedTicketId === id) setSelectedTicketId(null)`
 *       分岐は、現在の UI フロー (詳細表示中は一覧/Delete ボタンが非表示) では
 *       到達不能なディフェンシブコード。本テストはその分岐そのものを直接叩くものではなく、
 *       「詳細を閉じてから同じ id を Delete する」という現実的な経路の回帰検証を目的とする。
 *
 * 統合テストのため numRuns は控えめ。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

describe('App - delete-after-detail flow', () => {
  it('詳細表示 → 閉じる → 同じチケットを Delete: 件数が1減り empty に近づく', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;
          const target = cards[index % cards.length];
          const targetId = target.getAttribute('data-ticket-id');

          // 詳細表示 → 閉じる
          fireEvent.click(within(target).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          fireEvent.click(q.getByTestId('detail-close-button'));
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          // 同じ id のカードを Delete
          const cardsAfter = q.getAllByTestId('ticket-card');
          const sameCard = cardsAfter.find(
            c => c.getAttribute('data-ticket-id') === targetId
          );
          expect(sameCard).toBeTruthy();
          fireEvent.click(within(sameCard!).getByTestId('delete-button'));

          const remainingIds = q
            .queryAllByTestId('ticket-card')
            .map(c => c.getAttribute('data-ticket-id'));
          expect(remainingIds).not.toContain(targetId);
          expect(remainingIds.length).toBe(cards.length - 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細表示 → 閉じる → 別チケットを Delete: 残ったカードに対象が含まれない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length < 2) return;

          const selectedId = cards[0].getAttribute('data-ticket-id');
          const otherId = cards[1].getAttribute('data-ticket-id');

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          fireEvent.click(q.getByTestId('detail-close-button'));

          const cardsAfter = q.getAllByTestId('ticket-card');
          const otherCard = cardsAfter.find(
            c => c.getAttribute('data-ticket-id') === otherId
          );
          expect(otherCard).toBeTruthy();
          fireEvent.click(within(otherCard!).getByTestId('delete-button'));

          const remainingIds = q
            .queryAllByTestId('ticket-card')
            .map(c => c.getAttribute('data-ticket-id'));
          expect(remainingIds).not.toContain(otherId);
          // 選択していた id はまだ残っている (削除対象は別チケットだったため)
          expect(remainingIds).toContain(selectedId);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('一覧から全チケットを削除しきると empty-state が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          let cards = q.queryAllByTestId('ticket-card');
          let safety = 20;
          while (cards.length > 0 && safety-- > 0) {
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
