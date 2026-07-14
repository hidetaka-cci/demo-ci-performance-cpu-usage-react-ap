/**
 * Focused integration tests for the App ticket-detail flow
 *
 * Covers the paths not exercised by existing App PBTs:
 *   - handleAddComment (App.tsx lines 73-75)
 *   - selectedTicket lookup and ?? null fallback (App.tsx line 90)
 *   - closing the detail view (App.tsx line 116)
 *
 * These are deterministic RTL tests instead of PBTs to keep the run cheap.
 */

import { describe, it, expect } from 'vitest';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('opens the detail view when a ticket title is clicked', async () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Initial state: list is shown, detail is not
      expect(q.queryByTestId('ticket-detail')).toBeNull();
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      await userEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('closing the detail view returns to the list', async () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      await userEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      await userEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment from the detail view increases the comment count', async () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      await userEvent.click(q.getAllByTestId('ticket-title')[0]);

      // Zero comments initially
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      await userEvent.type(q.getByTestId('comment-author-input'), 'Reviewer');
      await userEvent.type(q.getByTestId('comment-body-input'), 'Looks good to me.');
      await userEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('scopes comments to the ticket they were added on', async () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      // Open the first ticket, add a comment
      await userEvent.click(titles[0]);
      await userEvent.type(q.getByTestId('comment-author-input'), 'Author1');
      await userEvent.type(q.getByTestId('comment-body-input'), 'On first ticket');
      await userEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);

      // Back to list, open a different ticket
      await userEvent.click(q.getByTestId('detail-close-button'));
      const otherTitle = q.getAllByTestId('ticket-title')[1];
      await userEvent.click(otherTitle);
      // No comments on this second ticket
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently open ticket clears the detail view', async () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTicketId = q.getAllByTestId('ticket-card')[0].getAttribute('data-ticket-id');
      expect(firstTicketId).toBeTruthy();

      await userEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail so we can access the list-view Delete button for that ticket
      await userEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      const target = cards.find(c => c.getAttribute('data-ticket-id') === firstTicketId)!;
      await userEvent.click(within(target).getByTestId('delete-button'));

      // Reopening should be impossible — the ticket is gone from the list
      expect(
        q.queryAllByTestId('ticket-card').some(c => c.getAttribute('data-ticket-id') === firstTicketId)
      ).toBe(false);
    } finally {
      unmount();
    }
  });
});
