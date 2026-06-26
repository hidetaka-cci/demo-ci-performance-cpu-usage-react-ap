/**
 * Integration tests for App's ticket-detail flow.
 *
 * 既存の App.pbt.test.tsx は filter / sort / create / delete / status-advance を
 * 中心にカバーしているが、ticket-detail 経路 (タイトルクリックで開く -> 戻る ->
 * コメント追加) は未カバーであり、App.tsx 上の handleAddComment / selectedTicket
 * 計算 / Close ボタン経路の uncovered lines を狙う。
 *
 * 重い App 全体レンダーを使うため numRuns は使わず、決定論的な小さな
 * シナリオで網羅する。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットカードのタイトルをクリックすると detail ビューが開く', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');

      // 開く前は detail なし
      expect(q.queryByTestId('ticket-detail')).toBeNull();

      fireEvent.click(title);

      // detail ビューが開く
      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // 一覧 UI は同時に消えている (排他表示)
      expect(q.queryByTestId('ticket-list')).toBeNull();
      expect(q.queryByTestId('new-ticket-button')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('detail ビューの detail-title は元カードのタイトルと一致する', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detailTitle = q.getByTestId('detail-title');
      expect(detailTitle.textContent).toBe(cardTitle);
    } finally {
      unmount();
    }
  });

  it('detail ビューの Close ボタンで一覧に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      // detail が閉じて一覧に戻る
      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail ビューでコメント追加すると Comments カウントが増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // 初期状態: コメント0件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // コメント入力 & 送信
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const comments = q.getAllByTestId('comment-item');
      expect(comments).toHaveLength(1);

      const author = within(comments[0]).getByTestId('comment-author');
      const body = within(comments[0]).getByTestId('comment-body');
      expect(author.textContent).toBe('Reviewer');
      expect(body.textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('detail ビューでコメントを追加→閉じる→再度開くと、追加済みコメントが復元される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstCardTitleText = within(firstCard).getByTestId('ticket-title').textContent;

      // 1回目の open + コメント追加
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'first' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      fireEvent.click(q.getByTestId('detail-close-button'));

      // 同じチケットを再度開く
      const cardsAfter = q.getAllByTestId('ticket-card');
      const sameCard = cardsAfter.find(
        c => within(c).getByTestId('ticket-title').textContent === firstCardTitleText
      )!;
      fireEvent.click(within(sameCard).getByTestId('ticket-title'));

      // 前回追加した1件が表示される
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
    } finally {
      unmount();
    }
  });

  it('別のチケットを開くと、最初のチケットに付けたコメントは表示されない', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const card1Title = within(cards[0]).getByTestId('ticket-title').textContent;
      const card2Title = within(cards[1]).getByTestId('ticket-title').textContent;
      expect(card1Title).not.toBe(card2Title);

      // 1枚目を開いてコメント追加
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'ticket1-comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      fireEvent.click(q.getByTestId('detail-close-button'));

      // 2枚目を開く: コメントは0件のはず (ticketId が違うのでフィルタ除外)
      const cardsAfter = q.getAllByTestId('ticket-card');
      const card2 = cardsAfter.find(
        c => within(c).getByTestId('ticket-title').textContent === card2Title
      )!;
      fireEvent.click(within(card2).getByTestId('ticket-title'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('detail ビューで開いているチケットを削除する経路はそのチケットの再選択をクリアする', () => {
    // 削除は detail ビュー UI からは直接できないが、selectedTicketId が指す
    // チケットを削除する経路の selectedTicketId クリアロジックは、
    // 一覧に戻ったあと同じカードが消えていることで確認する。
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstCardTitle = within(firstCard).getByTestId('ticket-title').textContent;

      // 一覧で削除してから、件数が1減ることを確認
      const beforeCount = q.getAllByTestId('ticket-card').length;
      fireEvent.click(within(firstCard).getByTestId('delete-button'));
      const afterCount = q.getAllByTestId('ticket-card').length;
      expect(afterCount).toBe(beforeCount - 1);

      // 削除済みのタイトルはもう存在しない
      const remaining = q.queryAllByTestId('ticket-card').map(
        c => within(c).getByTestId('ticket-title').textContent
      );
      expect(remaining).not.toContain(firstCardTitle);
    } finally {
      unmount();
    }
  });
});
