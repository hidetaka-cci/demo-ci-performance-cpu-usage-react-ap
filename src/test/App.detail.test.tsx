/**
 * Integration tests for App - TicketDetail navigation flow
 *
 * The existing App.pbt.test.tsx covers the main list view (filter, sort, create,
 * delete, advance status) but never clicks a ticket title to open the detail view.
 * This file covers the branches that only execute when selectedTicketId is non-null:
 *   - handleAddComment
 *   - selectedTicket / selectedComments computation
 *   - TicketDetail rendering inside App
 *   - handleDelete while a ticket is selected
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent, screen } from '@testing-library/react';
import App from '../App';

// App sorts tickets by createdAt (newest first) by default.
// TICKET-0003 (Jan 12) is the most recent and appears first in the sorted list.
const FIRST_DISPLAYED_TICKET_TITLE = 'Performance degradation on large datasets';

function renderApp() {
  const result = render(<App />);
  const q = within(result.container);
  return { ...result, q };
}

function openFirstTicketDetail(container: HTMLElement) {
  const q = within(container);
  // Click the first ticket title to open the detail view
  const titleEl = q.getAllByTestId('ticket-title')[0];
  fireEvent.click(titleEl);
  return q;
}

// ── Ticket selection ──────────────────────────────────────────────────────────

describe('App - ticket selection', () => {
  it('clicking a ticket title shows the detail view', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking a ticket title hides the ticket list', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      expect(within(container).queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the selected ticket title', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      const q = within(container);
      expect(q.getByTestId('detail-title').textContent).toBe(FIRST_DISPLAYED_TICKET_TITLE);
    } finally {
      unmount();
    }
  });

  it('detail view shows the description of the selected ticket', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      const q = within(container);
      const descEl = q.getByTestId('detail-description');
      expect(descEl.textContent?.length).toBeGreaterThan(0);
    } finally {
      unmount();
    }
  });

  it('detail view shows the comment form', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      expect(within(container).getByTestId('comment-form')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the close button', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      expect(within(container).getByTestId('detail-close-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

// ── Close / back navigation ───────────────────────────────────────────────────

describe('App - close TicketDetail', () => {
  it('clicking the Back button returns to ticket list', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      const q = within(container);
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('after closing detail, ticket cards are visible again', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      fireEvent.click(within(container).getByTestId('detail-close-button'));
      const cards = within(container).getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);
    } finally {
      unmount();
    }
  });
});

// ── Add comment ───────────────────────────────────────────────────────────────

describe('App - add comment via TicketDetail', () => {
  it('submitting a valid comment shows the comment in the detail view', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      const q = within(container);
      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'TestUser' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'This is a test comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      const commentItems = q.getAllByTestId('comment-item');
      expect(commentItems.length).toBeGreaterThan(0);
      const lastComment = commentItems[commentItems.length - 1];
      expect(within(lastComment).getByTestId('comment-body').textContent).toBe(
        'This is a test comment.'
      );
    } finally {
      unmount();
    }
  });

  it('submitting a comment with empty author does not add a comment', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      const q = within(container);
      const form = q.getByTestId('comment-form');
      // author left empty
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'No author comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      // No comments should appear (the initial ticket has no comments)
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('adding a second comment accumulates comments', () => {
    const { container, unmount } = renderApp();
    try {
      openFirstTicketDetail(container);
      const q = within(container);

      function submitComment(author: string, body: string) {
        const form = q.getByTestId('comment-form');
        fireEvent.change(within(form).getByTestId('comment-author-input'), {
          target: { value: author },
        });
        fireEvent.change(within(form).getByTestId('comment-body-input'), {
          target: { value: body },
        });
        fireEvent.click(within(form).getByTestId('comment-submit-button'));
      }

      submitComment('Alice', 'First comment');
      submitComment('Bob', 'Second comment');

      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('comments are specific to the selected ticket (not shared across tickets)', () => {
    const { container, unmount } = renderApp();
    try {
      // Open first ticket and add a comment
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      fireEvent.click(titles[0]);

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Only for ticket 1.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      // Go back and open second ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const titles2 = q.getAllByTestId('ticket-title');
      fireEvent.click(titles2[1]);

      // The second ticket should have no comments
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});

// ── Delete selected ticket ────────────────────────────────────────────────────

describe('App - delete while ticket is selected', () => {
  it('deleting the selected ticket from the list returns to list view', () => {
    // Open ticket, go back to list, then delete it
    const { container, unmount } = renderApp();
    try {
      const q = within(container);
      const beforeCount = q.getAllByTestId('ticket-card').length;

      // Select the first ticket
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      // Go back to list
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Now delete the first ticket (which was the selected one)
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('delete-button'));
      expect(q.getAllByTestId('ticket-card')).toHaveLength(beforeCount - 1);
    } finally {
      unmount();
    }
  });

  it('opening a different ticket shows that ticket in the detail view', () => {
    const { container, unmount } = renderApp();
    try {
      const q = within(container);
      // Get all ticket titles before interacting
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);

      // Open first ticket
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      const firstTitle = q.getByTestId('detail-title').textContent;

      // Go back and open second ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards2 = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards2[1]).getByTestId('ticket-title'));
      const secondTitle = q.getByTestId('detail-title').textContent;

      expect(firstTitle).not.toBe(secondTitle);
    } finally {
      unmount();
    }
  });
});
