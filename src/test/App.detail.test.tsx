/**
 * Integration tests for App's ticket-detail flow.
 *
 * The existing App.pbt.test.tsx never selects a ticket, so the following App.tsx
 * branches were untested (coverage report flagged lines 73-75, 90, 116):
 *   - handleAddComment body (selectedTicketId branch + addComment)
 *   - selectedTicket lookup via tickets.find(...)
 *   - onClose -> setSelectedTicketId(null)
 *
 * These tests drive the UI: select a ticket card -> open TicketDetail ->
 * add a comment -> close. They also assert that deleting the currently
 * selected ticket returns the user to the list view.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).toBeNull();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;
      expect(within(detail).getByTestId('detail-title').textContent).toBe(cardTitle);
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
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('TicketDetail でコメント送信するとコメント数が増え、コメントが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const dq = within(detail);

      // Initially no comments
      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(dq.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(dq.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(dq.getByTestId('comment-submit-button'));

      const items = dq.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('TicketDetail でコメントを連続送信すると全件が表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(
        within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title')
      );
      const dq = within(q.getByTestId('ticket-detail'));

      for (let i = 0; i < 3; i++) {
        fireEvent.change(dq.getByTestId('comment-author-input'), {
          target: { value: `Author-${i}` },
        });
        fireEvent.change(dq.getByTestId('comment-body-input'), {
          target: { value: `Comment body ${i}` },
        });
        fireEvent.click(dq.getByTestId('comment-submit-button'));
      }

      expect(dq.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除するとリスト表示に戻る (handleDelete の selectedTicketId 一致分岐)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstCardId = firstCard.getAttribute('data-ticket-id');
      expect(firstCardId).toBeTruthy();

      // Select the ticket
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail to access the list and delete the same ticket
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Re-select and confirm detail shown
      const matching = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === firstCardId);
      expect(matching).toBeDefined();
      fireEvent.click(within(matching!).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close, then delete that ticket from list view
      fireEvent.click(q.getByTestId('detail-close-button'));
      const toDelete = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === firstCardId)!;
      fireEvent.click(within(toDelete).getByTestId('delete-button'));

      // We're back on the list, and the deleted ticket is gone
      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(
        q
          .queryAllByTestId('ticket-card')
          .some(c => c.getAttribute('data-ticket-id') === firstCardId)
      ).toBe(false);
    } finally {
      unmount();
    }
  });

  it('空の入力ではコメントが追加されない (CommentForm のガードと App ハンドラ整合)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(
        within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title')
      );
      const dq = within(q.getByTestId('ticket-detail'));

      // Click submit without any input
      fireEvent.click(dq.getByTestId('comment-submit-button'));
      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      // Provide only author -> still rejected
      fireEvent.change(dq.getByTestId('comment-author-input'), {
        target: { value: 'OnlyName' },
      });
      fireEvent.click(dq.getByTestId('comment-submit-button'));
      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      // Provide only body -> still rejected
      fireEvent.change(dq.getByTestId('comment-author-input'), {
        target: { value: '' },
      });
      fireEvent.change(dq.getByTestId('comment-body-input'), {
        target: { value: 'Only body' },
      });
      fireEvent.click(dq.getByTestId('comment-submit-button'));
      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
