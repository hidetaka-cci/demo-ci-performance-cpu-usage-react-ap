/**
 * Coverage tests for App's ticket-detail flow.
 *
 * The existing PBT suite does not click a ticket title to open the detail
 * view, so App.tsx's ticket-selection branches remain uncovered:
 *  - selectedTicket lookup (App.tsx line 90)
 *  - handleAddComment when a ticket is selected (lines 73–75)
 *  - onClose resetting selectedTicketId (line 116)
 *
 * These deterministic tests use the initial ticket seed baked into App.tsx.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view flow', () => {
  it('ticket-title クリックで detail view に切り替わる', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // list controls are hidden when a ticket is selected
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view の Close で一覧に戻る', () => {
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

  it('detail view から有効なコメントを送信するとコメントリストに反映される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // 初期状態: comment-list は 0 件のため描画されない
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to ship.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const commentItems = q.getAllByTestId('comment-item');
      expect(commentItems).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good to ship.');
    } finally {
      unmount();
    }
  });

  it('detail 表示中に選択チケットを Delete すると一覧に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const beforeCount = cards.length;

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Delete lives on the card, not the detail view; close first, then delete.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const remaining = q.getAllByTestId('ticket-card');
      fireEvent.click(within(remaining[0]).getByTestId('delete-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getAllByTestId('ticket-card').length).toBe(beforeCount - 1);
    } finally {
      unmount();
    }
  });

  it('選択されたチケットのタイトルが detail view に表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const titleText = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(titleText);
    } finally {
      unmount();
    }
  });
});
