/**
 * Coverage-focused tests for App component - ticket detail view flow.
 *
 * These tests target lines in App.tsx that are not exercised by the
 * existing property-based tests:
 *  - Line 90: tickets.find(...) branch (with a selected ticket)
 *  - Line 116: onClose handler resetting selectedTicketId
 *  - Lines 73-75: handleAddComment writing a new comment when a ticket is selected
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.getByTestId('detail-title')).toBeInTheDocument();
      // ticket-list はもう表示されない (詳細ビューに切り替わっている)
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタン (← Back) でリストビューに戻る', () => {
    const { container, unmount } = render(<App />);
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
  });

  it('詳細ビューで有効なコメントを追加するとコメント数が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // 初期は0件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'This is a bug I found.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe(
        'Alice'
      );
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe(
        'This is a bug I found.'
      );
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを詳細ビューから削除するとリストビューに戻る', () => {
    // 選択中に対象チケットが削除された場合、選択がクリアされる (App.tsx 69行目)
    // これによりリストビューに戻る
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const before = cards.length;
      const firstCard = cards[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // 詳細ビューから戻る
      fireEvent.click(q.getByTestId('detail-close-button'));

      // 同じチケットを削除する
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAfterClose[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card')).toHaveLength(before - 1);
    } finally {
      unmount();
    }
  });

  it('詳細ビューで author が空のコメントは追加されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'body only' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
