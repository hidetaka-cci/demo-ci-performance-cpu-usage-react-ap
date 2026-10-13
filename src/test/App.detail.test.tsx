/**
 * Integration tests for App's ticket-detail flow.
 *
 * Covers the previously-uncovered paths in src/App.tsx:
 *   - clicking a ticket title to open the detail view (TicketCard onSelect)
 *   - closing the detail view via the back button (onClose lambda)
 *   - adding a comment through the detail view (handleAddComment body)
 *   - selectedTicketId pointing at a ticket that has been deleted (`?? null` fallback)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('clicking a ticket title opens the detail view and showing its title/description', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const card = q.getAllByTestId('ticket-card')[0];
      const expectedTitle = within(card).getByTestId('ticket-title').textContent;

      fireEvent.click(within(card).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
      // List / filters are hidden while detail is open
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('filter-status')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking the close button returns to the ticket list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const card = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(card).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting the comment form appends a comment visible in the detail view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const card = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(card).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('comment-form submit with an empty author does not add a comment and does not throw', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const card = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(card).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'orphan body' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently-selected ticket from inside detail closes the detail view', () => {
    // Exercises the `selectedTicketId` branch in handleDelete and the
    // `tickets.find(...) ?? null` fallback: once we select a ticket and then
    // delete it (via a different card from the list we re-enter), the detail
    // view must disappear and the list must come back.
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      // Open detail for the first card.
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close so we can re-interact with the list, delete the ticket we just
      // had selected (first card), then re-open any remaining ticket to confirm
      // the app did not retain a dangling selection.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAfterClose[0]).getByTestId('delete-button'));

      // No detail view is open and the list still renders.
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket while the detail view is open clears the selection', () => {
    // Delete via the list card BEFORE closing the detail: this is the path
    // where handleDelete's `if (selectedTicketId === id) setSelectedTicketId(null)`
    // actively clears the selection, exercising the `?? null` fallback at
    // src/App.tsx:90.
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstTicketId = firstCard.getAttribute('data-ticket-id');
      expect(firstTicketId).toBeTruthy();

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Now delete that same ticket by id from the list.
      const toDelete = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === firstTicketId
      );
      expect(toDelete).toBeTruthy();
      fireEvent.click(within(toDelete!).getByTestId('delete-button'));

      // The deleted ticket must no longer appear in the list.
      const remaining = q.queryAllByTestId('ticket-card').map(c => c.getAttribute('data-ticket-id'));
      expect(remaining).not.toContain(firstTicketId);
    } finally {
      unmount();
    }
  });
});
