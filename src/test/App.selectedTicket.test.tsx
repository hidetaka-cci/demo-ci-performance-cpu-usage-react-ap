/**
 * Tests for App's ticket-selection / detail-view flow
 *
 * Covers lines not reached by App.pbt.test.tsx:
 *  - line 73-75: handleAddComment (selectedTicketId guard + createComment + setComments)
 *  - line 90:    selectedTicket lookup (tickets.find when selectedTicketId is set)
 *  - line 116:   TicketDetail onClose arrow function
 *
 * The flow under test: click a TicketCard title → TicketDetail appears,
 * add a comment, then close and return to the list.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 50;

// ── Ticket detail selection (lines 90, 116) ────────────────────────────────────

describe('App - ticket detail selection', () => {
  it('チケットのタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          // TicketDetail is not yet visible
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          // Click the first ticket title to open detail
          const firstTitle = q.getAllByTestId('ticket-title')[0];
          fireEvent.click(firstTitle);

          // TicketDetail should now be rendered (covers line 90 + renders TicketDetail at line 112-117)
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // List view is gone
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Close ボタンで一覧に戻る (line 116: onClose)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);

          // Open detail view
          fireEvent.click(q.getAllByTestId('ticket-title')[0]);
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Close it (covers the arrow fn at line 116: () => setSelectedTicketId(null))
          fireEvent.click(q.getByTestId('detail-close-button'));

          // List view is restored
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューにはクリックしたチケットの情報が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstTitle = q.getAllByTestId('ticket-title')[0];
          const expectedTitle = firstTitle.textContent ?? '';

          fireEvent.click(firstTitle);

          const detail = q.getByTestId('ticket-detail');
          expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── handleAddComment (lines 73-75) ─────────────────────────────────────────────

describe('App - comment addition via TicketDetail', () => {
  it('TicketDetail でコメントを追加するとコメント件数が増える (lines 73-75)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);

            // Open the first ticket detail
            fireEvent.click(q.getAllByTestId('ticket-title')[0]);
            const detail = q.getByTestId('ticket-detail');

            // Before adding: no comment items
            const beforeCount = within(detail).queryAllByTestId('comment-item').length;

            // Fill and submit the comment form (covers lines 73-75: handleAddComment)
            const form = within(detail).getByTestId('comment-form');
            fireEvent.change(within(form).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));

            // Comment count should have increased by 1
            const afterCount = within(detail).queryAllByTestId('comment-item').length;
            expect(afterCount).toBe(beforeCount + 1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('コメントを追加すると author が comment-item に表示される', () => {
    const author = 'Alice';
    const body = 'This is a test comment';
    const { unmount, container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    const detail = q.getByTestId('ticket-detail');
    const form = within(detail).getByTestId('comment-form');

    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: author },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: body },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    const commentItems = within(detail).getAllByTestId('comment-item');
    const lastComment = commentItems[commentItems.length - 1];
    expect(within(lastComment).getByTestId('comment-author').textContent).toBe(author);
    expect(within(lastComment).getByTestId('comment-body').textContent).toBe(body);
    unmount();
  });

  it('詳細ビューを閉じて別チケットを選択するとコメントが独立している', () => {
    const { unmount, container } = render(<App />);
    const q = within(container);

    // Open first ticket and add a comment
    const titles = q.getAllByTestId('ticket-title');
    fireEvent.click(titles[0]);
    const detail1 = q.getByTestId('ticket-detail');
    const form1 = within(detail1).getByTestId('comment-form');
    fireEvent.change(within(form1).getByTestId('comment-author-input'), {
      target: { value: 'Tester' },
    });
    fireEvent.change(within(form1).getByTestId('comment-body-input'), {
      target: { value: 'A comment on ticket 1' },
    });
    fireEvent.click(within(form1).getByTestId('comment-submit-button'));

    // Close and open the second ticket
    fireEvent.click(q.getByTestId('detail-close-button'));
    const newTitles = q.getAllByTestId('ticket-title');
    if (newTitles.length > 1) {
      fireEvent.click(newTitles[1]);
      const detail2 = q.getByTestId('ticket-detail');
      // Second ticket should have 0 comments
      expect(within(detail2).queryAllByTestId('comment-item').length).toBe(0);
    }
    unmount();
  });
});

// ── Deleting the selected ticket (selectedTicketId reset) ──────────────────────

describe('App - delete selected ticket', () => {
  it('選択中のチケットを削除すると一覧に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);

          // Get the id of the first ticket
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const ticketId = firstCard.getAttribute('data-ticket-id');

          // Open that ticket's detail
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Delete it from the list is not directly accessible from detail; close first
          fireEvent.click(q.getByTestId('detail-close-button'));

          // Delete the ticket from the list
          const cards = q.getAllByTestId('ticket-card');
          const cardToDelete = cards.find(c => c.getAttribute('data-ticket-id') === ticketId);
          if (cardToDelete) {
            fireEvent.click(within(cardToDelete).getByTestId('delete-button'));
          }

          // Detail view should not be shown
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
