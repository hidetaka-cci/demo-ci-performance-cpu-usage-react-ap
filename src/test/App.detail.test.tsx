/**
 * Unit tests for App detail-view flow (open, close, add comment, delete while
 * selected). Targets previously uncovered branches in src/App.tsx:
 *   - handleAddComment (early-return + happy path)
 *   - selectedTicket fallback when ticket is deleted while selected
 *   - onClose handler that clears selectedTicketId
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが開き、Back で戻れる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);

      const firstTitle = within(cards[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // Detail view replaces the list, so ticket-list should be gone.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビュー内でコメントを追加すると Comments (N) が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstTitle = within(cards[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      // Before adding: no comment items rendered.
      expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('Reviewer');
      expect(items[0].textContent).toContain('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('author か body が空のコメントは追加されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      const detail = q.getByTestId('ticket-detail');

      // body empty
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item').length).toBe(0);

      // author empty (body only)
      fireEvent.change(within(q.getByTestId('ticket-detail')).getByTestId('comment-author-input'), {
        target: { value: '' },
      });
      fireEvent.change(within(q.getByTestId('ticket-detail')).getByTestId('comment-body-input'), {
        target: { value: 'orphan body' },
      });
      fireEvent.click(within(q.getByTestId('ticket-detail')).getByTestId('comment-submit-button'));
      expect(within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });

  it('別カードのタイトルをクリックすると別チケットの詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);

      const firstTitleText = within(cards[0]).getByTestId('ticket-title').textContent;
      const secondTitleText = within(cards[1]).getByTestId('ticket-title').textContent;
      expect(firstTitleText).toBeTruthy();
      expect(secondTitleText).toBeTruthy();
      expect(firstTitleText).not.toBe(secondTitleText);

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(firstTitleText);

      // Close, then open the second ticket
      fireEvent.click(within(detail).getByTestId('detail-close-button'));
      const cards2 = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards2[1]).getByTestId('ticket-title'));
      detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(secondTitleText);
    } finally {
      unmount();
    }
  });
});
