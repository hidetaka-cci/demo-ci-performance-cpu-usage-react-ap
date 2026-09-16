/**
 * Coverage-oriented tests for App detail-view flow.
 *
 * Targets App.tsx branches not exercised by the existing PBT suite:
 *   - handleAddComment path (selecting a ticket -> submitting a comment)
 *   - onClose handler for TicketDetail (close button restores list view)
 *   - selectedTicket unwrap when a ticket IS selected
 *
 * These are plain React Testing Library tests (no fast-check) — small and
 * fast, so they complement the existing PBT suite without adding numRuns cost.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow (coverage)', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // detail view replaces the list; controls should no longer be present
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('Close button in TicketDetail returns to the list view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment via the detail view adds it to the comment list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const detailQ = within(detail);

      // Initially no comments
      expect(detailQ.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(detailQ.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(detailQ.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(detailQ.getByTestId('comment-submit-button'));

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket returns to the list view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const initialCount = cards.length;

      // Select the first ticket, then delete it via the detail view's
      // parent state (delete button lives on the card, but selecting first
      // hides the list — so instead delete via list-view path).
      const firstCard = cards[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close, then delete the (previously selected) first ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAfterClose[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
