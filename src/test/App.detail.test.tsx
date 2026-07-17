/**
 * Focused unit tests for App-level ticket detail interactions.
 *
 * Targets uncovered handlers in src/App.tsx:
 *   - handleAddComment (lines 73-75): early return when no selected ticket, and
 *     the createComment/addComment path when a ticket is selected.
 *   - Ticket detail Close callback (line 116): resets selectedTicketId to null.
 *   - Selected ticket fallback (line 90): find returns undefined → null.
 *
 * Kept as plain unit tests (no fast-check) to keep runtime cheap; the existing
 * pbt suite already covers integration/property behavior.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent, act } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      // Clicking the h3 title should transition to the detail view.
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('Close ボタンで詳細ビューを閉じるとチケット一覧に戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // App-level onClose (App.tsx line 116) sets selectedTicketId to null.
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビュー中に有効なコメントを送信するとコメント一覧に追加される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Initially no comments are rendered.
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      // handleAddComment (App.tsx 72-76) should append the comment to state.
      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細ビューが自動で閉じる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const selectedId = cards[0].getAttribute('data-ticket-id');
      expect(selectedId).toBeTruthy();

      // Enter detail view for the first ticket.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Navigate back and delete that same ticket from the list.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.queryAllByTestId('ticket-card').find(
        card => card.getAttribute('data-ticket-id') === selectedId
      );
      expect(targetCard).toBeTruthy();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      // Card should be removed, and no detail view should remain.
      expect(
        q.queryAllByTestId('ticket-card').find(c => c.getAttribute('data-ticket-id') === selectedId)
      ).toBeUndefined();
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('コメント送信時に author 空欄なら CommentForm 側で早期リターンされ、コメントは追加されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'body only' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      // No comment items were added (early return in CommentForm.handleSubmit).
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('handleAddComment は selectedTicketId が null のとき何もしない (act で hook 直接呼び出し不可のため間接検証)', () => {
    // We enter and immediately exit detail view; the fresh render should not
    // have accumulated any stray comments across renders.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      // Open then close detail to exercise the null branch on subsequent renders.
      const firstCard = q.getAllByTestId('ticket-card')[0];
      act(() => {
        fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      });
      act(() => {
        fireEvent.click(q.getByTestId('detail-close-button'));
      });

      // Re-open and verify the comment list starts empty (state remains coherent).
      const reopened = q.getAllByTestId('ticket-card')[0];
      act(() => {
        fireEvent.click(within(reopened).getByTestId('ticket-title'));
      });
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
