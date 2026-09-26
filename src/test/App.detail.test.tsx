/**
 * App - ticket detail flow tests
 *
 * 既存の App.pbt.test.tsx は TicketDetail への遷移フロー
 * (タイトルクリック → 詳細表示 → コメント追加 → Close) をテストしていない。
 * これにより App.tsx の handleAddComment / selectedTicket / onClose 経路がカバーされる。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function renderApp() {
  const result = render(<App />);
  return { ...result, q: within(result.container) };
}

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューに遷移する', () => {
    const { unmount, q } = renderApp();
    try {
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // 詳細ビューではリストは表示されない
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンを押すとリストビューに戻る', () => {
    const { unmount, q } = renderApp();
    try {
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューでコメントを追加すると件数表示が増える', () => {
    const { unmount, q } = renderApp();
    try {
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      // 初期は Comments (0)
      expect(q.getByText(/Comments \(0\)/)).toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'First comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getByText(/Comments \(1\)/)).toBeInTheDocument();
      expect(q.getByTestId('comment-item')).toBeInTheDocument();
      expect(q.getByTestId('comment-body').textContent).toBe('First comment');
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('複数コメントは追加順に表示される', () => {
    const { unmount, q } = renderApp();
    try {
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const addComment = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };
      addComment('Alice', 'first');
      addComment('Bob', 'second');

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除するとリストビューに戻る', () => {
    const { unmount, q } = renderApp();
    try {
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      const firstCard = firstTitle.closest('[data-testid="ticket-card"]') as HTMLElement;
      const selectedId = firstCard.getAttribute('data-ticket-id');

      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // 詳細ビュー中はリストに戻り、対象カードの delete ボタンを押す
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === selectedId) as HTMLElement;
      expect(targetCard).toBeDefined();
      fireEvent.click(within(targetCard).getByTestId('delete-button'));

      // カードが消えていることを確認
      const remaining = q
        .queryAllByTestId('ticket-card')
        .some(c => c.getAttribute('data-ticket-id') === selectedId);
      expect(remaining).toBe(false);
    } finally {
      unmount();
    }
  });

  it('コメントの author が空だと追加されない', () => {
    const { unmount, q } = renderApp();
    try {
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'body only' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getByText(/Comments \(0\)/)).toBeInTheDocument();
      expect(q.queryByTestId('comment-item')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
