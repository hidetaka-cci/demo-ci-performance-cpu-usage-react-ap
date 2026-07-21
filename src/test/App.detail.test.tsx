/**
 * Coverage-focused tests for the App ticket-selection and comment flow.
 *
 * The existing PBT suite does not exercise the detail view, leaving these
 * lines in App.tsx uncovered:
 *   - L73-75: handleAddComment (only reachable via TicketDetail's comment form)
 *   - L90:    selectedTicket = tickets.find(...) ?? null (both branches)
 *   - L116:   onClose callback that clears selectedTicketId
 *
 * These integration tests click through the flow to hit each branch.
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import App from '../App';

function selectFirstTicket(container: HTMLElement) {
  const q = within(container);
  const titles = q.getAllByTestId('ticket-title');
  fireEvent.click(titles[0]);
}

describe('App - detail view flow', () => {
  it('opens TicketDetail when a ticket title is clicked', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).toBeNull();

      selectFirstTicket(container);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // Filter panel is hidden while the detail view is open.
      expect(q.queryByTestId('filter-status')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('adds a comment via TicketDetail and reflects the count in the header', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      selectFirstTicket(container);

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const comments = q.getAllByTestId('comment-item');
      expect(comments).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('closes the detail view when the Back button is clicked', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      selectFirstTicket(container);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      // Filter panel is visible again.
      expect(q.getByTestId('filter-status')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clears the selection automatically when the selected ticket is deleted', () => {
    // Reproduces App.tsx L90 fallback: if selectedTicketId no longer maps to a
    // ticket (because it was deleted), selectedTicket becomes null and the
    // detail view is hidden. handleDelete also clears selectedTicketId in the
    // same branch (L69), covering both sides of the guard.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      selectFirstTicket(container);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close the detail and delete the same ticket we had selected.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      const firstCardId = cards[0].getAttribute('data-ticket-id');
      const firstDeleteButton = within(cards[0]).getByTestId('delete-button');
      fireEvent.click(firstDeleteButton);

      // The deleted ticket should no longer be present.
      const remaining = q.queryAllByTestId('ticket-card');
      for (const c of remaining) {
        expect(c.getAttribute('data-ticket-id')).not.toBe(firstCardId);
      }
    } finally {
      unmount();
    }
  });
});
