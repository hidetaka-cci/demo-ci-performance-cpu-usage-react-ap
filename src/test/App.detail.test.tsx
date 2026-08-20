/**
 * Coverage tests for App's TicketDetail flow.
 *
 * Targets uncovered branches in App.tsx:
 *   - line 73-75: handleAddComment body (requires selectedTicketId)
 *   - line 90:    selectedTicket lookup via tickets.find
 *   - line 116:   onClose callback (setSelectedTicketId(null))
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // Detail title should match the clicked ticket's title
      const detailTitle = within(detail).getByTestId('detail-title').textContent;
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;
      expect(detailTitle).toBe(cardTitle);
    } finally {
      unmount();
    }
  });

  it('TicketDetail 表示中に Close ボタンでチケット一覧に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      // Ticket list should be visible again
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('TicketDetail からコメントを追加するとコメント件数が1増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const before = within(detail).queryAllByTestId('comment-item').length;

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const after = within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item').length;
      expect(after).toBe(before + 1);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを別カード経由で削除しても UI はクラッシュせず一覧に戻る', () => {
    // Covers App line 69: if (selectedTicketId === id) setSelectedTicketId(null)
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail (so we can access the card list) and then delete the same ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsBefore = q.getAllByTestId('ticket-card');
      const before = cardsBefore.length;
      fireEvent.click(within(cardsBefore[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card').length).toBe(before - 1);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
