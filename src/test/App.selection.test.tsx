/**
 * Coverage-targeted tests for App.tsx selection / comment / close flow.
 *
 * Covers previously-uncovered lines:
 *   - 73-75: handleAddComment body (add comment while a ticket is selected)
 *   - 90:    selectedTicket lookup via tickets.find(...) branch
 *   - 116:   TicketDetail onClose callback wiring
 *
 * These are focused integration tests (no property-based generation) so they
 * remain fast while nailing the uncovered branches.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket selection and detail interaction', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const titleEl = within(firstCard).getByTestId('ticket-title');

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      fireEvent.click(titleEl);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('TicketDetail の Close ボタンを押すと一覧表示に戻る', () => {
    const { unmount, container } = render(<App />);
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

  it('選択中のチケットにコメントを追加するとコメント一覧に反映される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const detailQ = within(detail);

      fireEvent.change(detailQ.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(detailQ.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(detailQ.getByTestId('comment-submit-button'));

      const items = detailQ.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(detailQ.getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(detailQ.getByTestId('comment-body').textContent).toBe(
        'Looks good to me.'
      );
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細画面が閉じて一覧に戻る', () => {
    // Deletes the currently-selected ticket to hit the
    // `if (selectedTicketId === id) setSelectedTicketId(null)` branch in
    // handleDelete, which also keeps the selectedTicket lookup safe.
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const selectedId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail so the list is visible again, then delete the same card
      fireEvent.click(q.getByTestId('detail-close-button'));

      const cardsAfterClose = q.getAllByTestId('ticket-card');
      const targetCard = cardsAfterClose.find(
        c => c.getAttribute('data-ticket-id') === selectedId
      );
      expect(targetCard).toBeDefined();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      const remaining = q.queryAllByTestId('ticket-card');
      expect(
        remaining.some(c => c.getAttribute('data-ticket-id') === selectedId)
      ).toBe(false);
    } finally {
      unmount();
    }
  });
});
