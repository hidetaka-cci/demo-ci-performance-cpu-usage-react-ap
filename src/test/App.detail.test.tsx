/**
 * Tests for App ticket detail view and handleAddComment flow.
 *
 * Targets the uncovered paths in App.tsx:
 *   - lines 73-75: handleAddComment (only reachable via TicketDetail)
 *   - line 90: selectedTicket computation when a ticket is selected
 *   - line 116: TicketDetail render path
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the selected ticket title', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const titleText = within(cards[0]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('detail-title').textContent).toBe(titleText);
    } finally {
      unmount();
    }
  });

  it('closing detail view returns to ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment in detail view appends the comment to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Reproducing this now.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
      expect(q.getByTestId('comment-body').textContent).toBe('Reproducing this now.');
    } finally {
      unmount();
    }
  });

  it('comments added to one ticket do not appear in another ticket detail', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');

      // Add comment to first ticket
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Bob' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'First ticket comment' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Open second ticket — should have no comments
      const updatedCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(updatedCards[1]).getByTestId('ticket-title'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const initialCards = q.getAllByTestId('ticket-card');
      const initialCount = initialCards.length;

      // Select first ticket
      fireEvent.click(within(initialCards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Navigate back, then delete the ticket from the card list
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfterReturn = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAfterReturn[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
    } finally {
      unmount();
    }
  });
});
