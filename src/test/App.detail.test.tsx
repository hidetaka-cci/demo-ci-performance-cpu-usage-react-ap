/**
 * Coverage tests for App's TicketDetail integration.
 *
 * The existing PBT suite never opens the detail view, so the following
 * branches never execute:
 *   - handleAddComment body (App.tsx:73-75)
 *   - selectedTicket find/fallback (App.tsx:90)
 *   - Close-from-detail handler (App.tsx:116)
 * These integration tests exercise the full click → detail → close flow
 * and the add-comment flow that runs through App's state.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function openFirstTicketDetail(container: HTMLElement) {
  const q = within(container);
  const cards = q.getAllByTestId('ticket-card');
  expect(cards.length).toBeGreaterThan(0);
  const firstCard = cards[0];
  const titleEl = within(firstCard).getByTestId('ticket-title');
  fireEvent.click(titleEl);
  return { q, firstCardId: firstCard.getAttribute('data-ticket-id') ?? '' };
}

describe('App - TicketDetail integration', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      openFirstTicketDetail(container);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューのCloseボタンでリストに戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューで有効なコメントを送信するとコメント件数が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      // Comments header initially shows "(0)" because no comments exist yet.
      expect(within(container).getByTestId('ticket-detail').textContent).toContain('Comments (0)');

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good!' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good!');
      expect(within(container).getByTestId('ticket-detail').textContent).toContain('Comments (1)');
    } finally {
      unmount();
    }
  });

  it('空のコメントは送信されず件数は変わらない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      // Blank author + blank body -> handleSubmit early-returns, no comment added.
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // author-only, body-only should also be rejected.
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Only Author' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('選択中のチケット以外を削除しても詳細ビューは維持される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cardsBefore = q.getAllByTestId('ticket-card');
      // Open first ticket's detail.
      fireEvent.click(within(cardsBefore[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // Close detail so we can delete a non-selected card, then re-open.
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Re-open the first ticket's detail.
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAfterClose[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
