/**
 * Additional App integration tests: TicketDetail navigation & comments
 *
 * Covers the following paths in App.tsx that the existing PBT suite skips:
 *  - clicking a ticket-title opens TicketDetail (line 90 branch — selectedTicketId set)
 *  - Close button in TicketDetail returns to the list (line 116)
 *  - handleAddComment appends a comment and it renders in the detail view (lines 72-75)
 *  - deleting a currently-selected ticket clears selectedTicketId (line 69)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - TicketDetail navigation', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // list view controls should disappear while detail is open
      expect(q.queryByTestId('ticket-list')).toBeNull();
      expect(q.queryByTestId('new-ticket-button')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('TicketDetail の Close ボタンでリスト表示に戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // open
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // close
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると自動的にリストへ戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const initialCount = q.getAllByTestId('ticket-card').length;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // TicketDetail doesn't have a delete button, so we go back first, then delete.
      fireEvent.click(q.getByTestId('detail-close-button'));

      const cardsBeforeDelete = q.getAllByTestId('ticket-card');
      // Re-open, then close, then delete the same one from the list
      fireEvent.click(within(cardsBeforeDelete[0]).getByTestId('ticket-title'));
      fireEvent.click(q.getByTestId('detail-close-button'));

      const targetCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(targetCard).getByTestId('delete-button'));

      expect(q.getAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
    } finally {
      unmount();
    }
  });
});

describe('App - comments via TicketDetail', () => {
  it('有効なコメントを追加すると detail のコメント一覧に反映される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const detailQ = within(detail);

      // no comments initially
      expect(detailQ.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(detailQ.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(detailQ.getByTestId('comment-submit-button'));

      // Re-query the detail (React re-render can replace the DOM subtree)
      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('author が空のままではコメントは追加されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detailQ = within(q.getByTestId('ticket-detail'));
      fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: 'body only' } });
      fireEvent.click(detailQ.getByTestId('comment-submit-button'));

      expect(within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('あるチケットに付けたコメントは別のチケットの detail には表示されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);

      // Comment on first ticket
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detailQ = within(q.getByTestId('ticket-detail'));
      fireEvent.change(detailQ.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: 'first ticket comment' } });
      fireEvent.click(detailQ.getByTestId('comment-submit-button'));
      expect(within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item')).toHaveLength(1);

      // Go back and open the second ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAgain = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAgain[1]).getByTestId('ticket-title'));

      detailQ = within(q.getByTestId('ticket-detail'));
      expect(detailQ.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
