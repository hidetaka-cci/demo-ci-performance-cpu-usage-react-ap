/**
 * Coverage tests for the App ticket-detail flow.
 *
 * Lines 73-75, 90, and 116 of App.tsx (handleAddComment, the selectedTicket
 * fallback, and the TicketDetail onClose handler) are not exercised by the
 * existing integration tests. These tests click into the detail view from a
 * ticket card title, add a comment, then close the detail panel.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function renderApp() {
  const result = render(<App />);
  return { ...result, q: within(result.container) };
}

describe('App - ticket detail flow', () => {
  it('カードタイトルをクリックすると詳細ビューに切り替わる', () => {
    const { q, unmount } = renderApp();
    try {
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューで表示される title は選択したカードと一致する', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(cardTitle);
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンを押すとリスト表示に戻る', () => {
    const { q, unmount } = renderApp();
    try {
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

  it('有効なコメント送信後にコメント件数が1増える', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good');
    } finally {
      unmount();
    }
  });

  it('空 author/body のままではコメントは追加されない', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると自動的にリストビューへ戻る', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const cardCountBefore = q.getAllByTestId('ticket-card').length;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(targetCard).getByTestId('ticket-title'));
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardToDelete = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(cardToDelete).getByTestId('delete-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getAllByTestId('ticket-card').length).toBe(cardCountBefore - 1);
    } finally {
      unmount();
    }
  });
});
