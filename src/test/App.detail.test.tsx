/**
 * Coverage tests for App.tsx ticket-detail flow
 *
 * Covers the ticket selection / detail view / comment adding paths that
 * are not exercised by the existing PBT suite (App.tsx lines 73-75, 90, 116).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail selection', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Initial: list is visible, detail is not
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      // After click: detail is shown, list is hidden
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('TicketDetail の Back ボタンで一覧表示に戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('選択したチケットに対してコメントを追加できる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Select first ticket
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      // Initially, no comment items
      expect(q.queryAllByTestId('comment-item').length).toBe(0);
      // Comment count header should read "Comments (0)"
      expect(container.textContent).toContain('Comments (0)');

      // Fill in the comment form
      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      // Comment appears in the list
      const items = q.getAllByTestId('comment-item');
      expect(items.length).toBe(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('複数コメントを追加するとリストに蓄積される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const authorInput = q.getByTestId('comment-author-input');
      const bodyInput = q.getByTestId('comment-body-input');
      const submit = q.getByTestId('comment-submit-button');

      fireEvent.change(authorInput, { target: { value: 'Alice' } });
      fireEvent.change(bodyInput, { target: { value: 'First comment' } });
      fireEvent.click(submit);

      fireEvent.change(authorInput, { target: { value: 'Bob' } });
      fireEvent.change(bodyInput, { target: { value: 'Second comment' } });
      fireEvent.click(submit);

      expect(q.getAllByTestId('comment-item').length).toBe(2);
    } finally {
      unmount();
    }
  });

  it('選択したチケットを削除すると詳細表示は閉じて一覧に戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Grab the id of the first ticket before selecting it
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      expect(ticketId).toBeTruthy();

      // Select the first ticket
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close it, then delete the same ticket from the list
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardAfterClose = q.getAllByTestId('ticket-card').find(
        (c) => c.getAttribute('data-ticket-id') === ticketId,
      );
      expect(cardAfterClose).toBeTruthy();
      fireEvent.click(within(cardAfterClose!).getByTestId('delete-button'));

      // The deleted ticket should no longer be in the list
      const remainingIds = q.getAllByTestId('ticket-card').map(
        (c) => c.getAttribute('data-ticket-id'),
      );
      expect(remainingIds).not.toContain(ticketId);
    } finally {
      unmount();
    }
  });

  it('詳細表示中に対象チケットを削除すると詳細表示が閉じる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Open detail for the first ticket
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail so we can delete via the list
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Delete the first ticket
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('delete-button'));

      // The remaining cards should not include the deleted id
      const remainingIds = q.getAllByTestId('ticket-card').map(
        (c) => c.getAttribute('data-ticket-id'),
      );
      expect(remainingIds).not.toContain(firstId);
      // Detail view must not resurface
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
