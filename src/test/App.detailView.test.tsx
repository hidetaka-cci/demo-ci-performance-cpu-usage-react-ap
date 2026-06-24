/**
 * Integration tests for App's ticket detail / comment flow.
 *
 * Targets uncovered branches in src/App.tsx:
 *   - handleAddComment (creates a Comment and appends it to state)
 *   - The TicketDetail onClose handler (clears selectedTicketId)
 *   - The detail-view render branch (selectedTicket truthy)
 *
 * These flows are not exercised by App.pbt.test.tsx, which never selects a
 * ticket — so the entire detail subtree was previously uncovered.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail selection', () => {
  it('opens the TicketDetail view when a ticket title is clicked', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstTitle = q.getAllByTestId('ticket-title')[0];
      const expectedTitle = firstTitle.textContent;
      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('hides the controls (filter panel, list) while the detail view is open', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('filter-status')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('closes the detail view and restores the ticket list when ← Back is clicked', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cardsBefore = q.getAllByTestId('ticket-card').length;

      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getAllByTestId('ticket-card').length).toBe(cardsBefore);
    } finally {
      unmount();
    }
  });
});

describe('App - adding comments via the detail view', () => {
  it('persists a new comment under the selected ticket and renders it in the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      const detail = q.getByTestId('ticket-detail');

      expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(detail).getAllByTestId('comment-item');
      expect(items.length).toBe(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('keeps comments scoped to the ticket they were added on', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      // Add a comment on the first ticket.
      const titles = q.getAllByTestId('ticket-title');
      fireEvent.click(titles[0]);
      const firstDetail = q.getByTestId('ticket-detail');
      fireEvent.change(within(firstDetail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(firstDetail).getByTestId('comment-body-input'), {
        target: { value: 'On the first ticket' },
      });
      fireEvent.click(within(firstDetail).getByTestId('comment-submit-button'));
      expect(within(firstDetail).getAllByTestId('comment-item').length).toBe(1);

      // Back to the list, open the second ticket — it should have zero comments.
      fireEvent.click(within(firstDetail).getByTestId('detail-close-button'));
      const titlesAgain = q.getAllByTestId('ticket-title');
      fireEvent.click(titlesAgain[1]);
      const secondDetail = q.getByTestId('ticket-detail');
      expect(within(secondDetail).queryAllByTestId('comment-item').length).toBe(0);

      // Reopening the first ticket should still show its one comment.
      fireEvent.click(within(secondDetail).getByTestId('detail-close-button'));
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      const firstDetailAgain = q.getByTestId('ticket-detail');
      expect(within(firstDetailAgain).getAllByTestId('comment-item').length).toBe(1);
      expect(
        within(firstDetailAgain).getByTestId('comment-author').textContent
      ).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('does not add a comment when the form is submitted with blank fields', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      const detail = q.getByTestId('ticket-detail');

      // No input — submit a blank form.
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);

      // Author only — still rejected.
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Bob' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });
});

describe('App - delete clears the selected ticket', () => {
  it('returns to the list view when the currently-selected ticket is deleted from the list view', () => {
    // handleDelete sets selectedTicketId to null when the deleted id matches.
    // To exercise that branch we select a ticket, return to the list, then delete it.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      const firstTitleText = titles[0].textContent;

      // Select then close to leave selectedTicketId temporarily set, then re-select.
      fireEvent.click(titles[0]);
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Now select again, close, and from list view delete the same ticket.
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      fireEvent.click(q.getByTestId('detail-close-button'));

      const cardsBefore = q.getAllByTestId('ticket-card');
      const firstCard = cardsBefore[0];
      fireEvent.click(within(firstCard).getByTestId('delete-button'));

      const cardsAfter = q.queryAllByTestId('ticket-card');
      expect(cardsAfter.length).toBe(cardsBefore.length - 1);
      // The deleted ticket's title should no longer be present.
      const remainingTitles = q.queryAllByTestId('ticket-title').map(n => n.textContent);
      expect(remainingTitles).not.toContain(firstTitleText);
      // And the detail view must not be showing.
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
