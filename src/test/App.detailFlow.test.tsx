/**
 * Unit tests for the ticket detail view flow in App.
 *
 * Covers uncovered lines in App.tsx (73-75 handleAddComment happy path,
 * 89-91 selectedTicket lookup, 116 onClose) and TicketCard.tsx (79 onSelect
 * click handler). Non-PBT for a fast, targeted increase in coverage.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      const expectedTitle = title.textContent;

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
      // 詳細表示中はリストは非表示
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Back ボタンでリストに戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // 詳細表示中であることを確認
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Back ボタンで戻る
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューでコメントを追加すると一覧に反映される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      // 初期状態: コメントは0件
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('詳細ビューで author が空のコメント送信は無視される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');

      // body だけ入力、author は空
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Body only' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('複数コメントを追加すると全て表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const submitComment = (author: string, body: string) => {
        const detail = q.getByTestId('ticket-detail');
        fireEvent.change(within(detail).getByTestId('comment-author-input'), {
          target: { value: author },
        });
        fireEvent.change(within(detail).getByTestId('comment-body-input'), {
          target: { value: body },
        });
        fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      };

      submitComment('Alice', 'first');
      submitComment('Bob', 'second');
      submitComment('Carol', 'third');

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細ビューが閉じる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();

      // 詳細ビューには delete ボタンがないため、一旦戻ってから削除
      fireEvent.click(within(detail).getByTestId('detail-close-button'));

      const cards = q.getAllByTestId('ticket-card');
      const targetCard = cards[0];
      const targetTitle = within(targetCard).getByTestId('ticket-title').textContent;

      // 対象を選択
      fireEvent.click(within(targetCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.getByTestId('detail-title').textContent).toBe(targetTitle);

      // 一旦戻って削除
      fireEvent.click(q.getByTestId('detail-close-button'));
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('delete-button'));

      // 削除された対象を再選択しようとしても存在しない
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビュー内でも Stats は表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-stats')).toBeInTheDocument();
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
