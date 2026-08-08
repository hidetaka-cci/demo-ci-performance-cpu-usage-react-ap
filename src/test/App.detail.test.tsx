/**
 * Coverage-boost tests for App component - detail view interactions.
 *
 * Existing PBT tests exercise the list view but never enter the detail
 * view, leaving App.tsx:73-75 (handleAddComment) and :116 (onClose)
 * uncovered.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function openDetailForFirstTicket() {
  const utils = render(<App />);
  const q = within(utils.container);
  const cards = q.getAllByTestId('ticket-card');
  const firstTitle = within(cards[0]).getByTestId('ticket-title');
  fireEvent.click(firstTitle);
  return { ...utils, q };
}

describe('App - ticket detail selection', () => {
  it('チケットタイトルをクリックすると詳細ビューが開く', () => {
    const { unmount, q } = openDetailForFirstTicket();
    try {
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // 一覧ビュー要素は表示されなくなる
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close (Back) ボタンで一覧ビューに戻る', () => {
    const { unmount, q } = openDetailForFirstTicket();
    try {
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

describe('App - comment interactions in detail view', () => {
  it('有効なコメントを送信するとコメント件数が1増える', () => {
    const { unmount, q } = openDetailForFirstTicket();
    try {
      // 初期状態: コメント 0 件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'First comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      const author = within(items[0]).getByTestId('comment-author');
      const body = within(items[0]).getByTestId('comment-body');
      expect(author.textContent).toBe('Alice');
      expect(body.textContent).toBe('First comment');
    } finally {
      unmount();
    }
  });

  it('複数コメント送信で全件が表示される', () => {
    const { unmount, q } = openDetailForFirstTicket();
    try {
      const submitComment = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };

      submitComment('Alice', 'one');
      submitComment('Bob', 'two');
      submitComment('Carol', 'three');

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('コメントの author が空の場合は送信されない', () => {
    const { unmount, q } = openDetailForFirstTicket();
    try {
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'body only' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('コメントの body が空の場合は送信されない', () => {
    const { unmount, q } = openDetailForFirstTicket();
    try {
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('別チケットを選択するとそのチケットに紐づくコメントだけ表示される', () => {
    const { unmount, container } = render(<App />);
    const q = within(container);
    try {
      const cards = q.getAllByTestId('ticket-card');
      // 最低2件必要 (初期状態は3件)
      expect(cards.length).toBeGreaterThanOrEqual(2);

      // 1件目にコメント追加
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'ticket-1 comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);

      // 一覧に戻って別チケットを開く
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards2 = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards2[1]).getByTestId('ticket-title'));

      // 別チケットのコメントは 0 件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
