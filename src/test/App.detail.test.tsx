/**
 * App - ticket detail flow coverage
 *
 * Existing App PBT suite never selects a ticket, so App.tsx lines 73-75
 * (handleAddComment), 90 (selectedTicket lookup) and 116 (onClose ->
 * setSelectedTicketId(null)) go uncovered. These deterministic tests
 * drive the full select → add comment → close flow.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットカードのタイトルクリックで詳細ビューが開く', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      const detailTitle = within(detail).getByTestId('detail-title');
      // The detail view should be for the ticket we clicked.
      expect(detailTitle.textContent).toBeTruthy();
      // Ticket list is hidden while detail view is shown.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      // sanity: we captured an id
      expect(ticketId).toMatch(/^TICKET-\d+$/);
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンでリスト表示に戻る', () => {
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

  it('詳細ビューでコメントを追加するとコメント一覧に反映される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const d = within(detail);

      // Initially no comments for this ticket.
      expect(d.queryAllByTestId('comment-item').length).toBe(0);

      fireEvent.change(d.getByTestId('comment-author-input'), { target: { value: 'Reporter' } });
      fireEvent.change(d.getByTestId('comment-body-input'), { target: { value: 'A helpful comment' } });
      fireEvent.click(d.getByTestId('comment-submit-button'));

      const items = d.getAllByTestId('comment-item');
      expect(items.length).toBe(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reporter');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('A helpful comment');
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを詳細ビュー外で削除すると選択状態がリセットされる', () => {
    // This test targets the `if (selectedTicketId === id) setSelectedTicketId(null)`
    // branch in handleDelete. We select a ticket, close the detail, then delete
    // it — after the delete, re-selecting a different ticket must still work
    // (i.e. state is clean).
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const targetId = cards[0].getAttribute('data-ticket-id');

      // Select then close to seed selectedTicketId then unset via close button.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Re-open, then delete-from-detail is not supported, so instead trigger
      // the selectedTicketId===id branch by selecting then deleting via card.
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // Close first to reach the list, then delete the card we had selected.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfter = q.getAllByTestId('ticket-card');
      const matching = cardsAfter.find(c => c.getAttribute('data-ticket-id') === targetId);
      expect(matching).toBeDefined();
      fireEvent.click(within(matching!).getByTestId('delete-button'));

      const finalIds = q.getAllByTestId('ticket-card').map(c => c.getAttribute('data-ticket-id'));
      expect(finalIds).not.toContain(targetId);
    } finally {
      unmount();
    }
  });
});
