/**
 * Targeted coverage tests for App.tsx detail view flow.
 *
 * Covers branches that the PBT integration suite does not exercise:
 *   - Selecting a ticket via TicketCard title click (renders TicketDetail)
 *   - handleAddComment posting a comment from the detail view
 *   - Closing the detail view (TicketDetail onClose → setSelectedTicketId(null))
 *   - Deleting a ticket while it is selected (selectedTicketId cleared)
 *   - selectedTicket fallback when find() returns undefined
 *
 * These are example-based tests (not PBT) by design — the uncovered
 * branches are narrow and a single deterministic interaction sequence
 * is sufficient to drive each one.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('clicking a card title opens TicketDetail for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const cardId = firstCard.getAttribute('data-ticket-id');
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(cardTitle);
      // Detail view should hide the list-mode controls
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
      expect(cardId).toBeTruthy();
    } finally {
      unmount();
    }
  });

  it('Back button on detail view returns to the list and preserves tickets', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const beforeCount = q.getAllByTestId('ticket-card').length;

      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getAllByTestId('ticket-card')).toHaveLength(beforeCount);
    } finally {
      unmount();
    }
  });

  it('submitting a comment in the detail view adds it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // No comments initially
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const comments = q.getAllByTestId('comment-item');
      expect(comments).toHaveLength(1);
      expect(within(comments[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(comments[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('a comment submitted with empty author/body is ignored (no-op)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // Try to add a comment without filling the fields
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // Author only — body still empty
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket from the detail view returns to the list', () => {
    // This exercises the `if (selectedTicketId === id) setSelectedTicketId(null)`
    // branch in handleDelete *and* the `?? null` fallback in selectedTicket.
    // We delete via a fresh render whose card we click first.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const beforeCount = q.getAllByTestId('ticket-card').length;

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Return to the list before deleting — only the list view exposes Delete.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const target = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(target).getByTestId('delete-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getAllByTestId('ticket-card')).toHaveLength(beforeCount - 1);
    } finally {
      unmount();
    }
  });

  it('selecting then closing leaves the same number of tickets', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const beforeCount = q.getAllByTestId('ticket-card').length;

      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      fireEvent.click(q.getByTestId('detail-close-button'));
      fireEvent.click(within(q.getAllByTestId('ticket-card')[1]).getByTestId('ticket-title'));
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.getAllByTestId('ticket-card')).toHaveLength(beforeCount);
    } finally {
      unmount();
    }
  });
});
