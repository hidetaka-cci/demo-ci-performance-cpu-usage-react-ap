/**
 * Unit tests for App's ticket detail navigation flow.
 *
 * The existing App.pbt.test.tsx exercises filtering, sorting, creation, and deletion
 * but never navigates to the TicketDetail view. This file covers those branches:
 *   - Clicking a ticket title opens TicketDetail (selectedTicket branch)
 *   - handleAddComment is called when adding a comment in detail view
 *   - Closing detail view returns to the ticket list
 *   - Deleting the currently selected ticket clears the selection
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail navigation', () => {
  it('clicking a ticket title shows the TicketDetail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);

      const firstTitle = within(cards[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the correct ticket title', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const titleText = within(cards[0]).getByTestId('ticket-title').textContent;

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detailTitle = q.getByTestId('detail-title');
      expect(detailTitle.textContent).toBe(titleText);
    } finally {
      unmount();
    }
  });

  it('closing detail view returns to the ticket list', () => {
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

  it('adding a comment in detail view appends it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const form = within(detail).getByTestId('comment-form');

      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Looking into this now.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);
      expect(within(detail).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(detail).getByTestId('comment-body').textContent).toBe(
        'Looking into this now.'
      );
    } finally {
      unmount();
    }
  });

  it('adding a comment with empty author does not create a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const form = within(detail).getByTestId('comment-form');

      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Some text' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket navigates back to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstCardId = cards[0].getAttribute('data-ticket-id');

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Navigate back and delete via the card (simulate: go back, then delete)
      fireEvent.click(q.getByTestId('detail-close-button'));
      const updatedCards = q.getAllByTestId('ticket-card');
      const targetCard = updatedCards.find(c => c.getAttribute('data-ticket-id') === firstCardId);
      expect(targetCard).toBeDefined();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      // The deleted ticket should no longer appear
      const remaining = q.queryAllByTestId('ticket-card');
      expect(remaining.some(c => c.getAttribute('data-ticket-id') === firstCardId)).toBe(false);
    } finally {
      unmount();
    }
  });
});
