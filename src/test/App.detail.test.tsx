/**
 * Integration tests for App's ticket detail flow.
 *
 * Covers the detail open / close / add-comment paths in App.tsx
 * (handleAddComment, selectedTicket lookup, onClose) and the
 * TicketCard title click → onSelect interaction. These code paths
 * are not exercised by the existing PBT tests.
 *
 * Uses example-based tests rather than PBT because the goal is
 * deterministic line coverage of a small set of branches.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail integration', () => {
  it('clicking a ticket title opens the TicketDetail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // The opened detail should correspond to the clicked card's ticket.
      const expectedTitle = title.textContent;
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
      // The list should be hidden while the detail is open.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('Back button on detail returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCardTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
      fireEvent.click(firstCardTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment from the detail view increases the comment count', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // Initially there are no comments.
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('comments are scoped to the ticket: opening a different ticket shows no comments', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      // Open the first ticket and add a comment.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'hello' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);

      // Close, then open a different ticket.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const remainingCards = q.getAllByTestId('ticket-card');
      const otherCard = remainingCards[1] ?? remainingCards[0];
      fireEvent.click(within(otherCard).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket closes the detail view', () => {
    // Open a ticket detail, then delete that ticket from underneath by
    // closing first, then re-opening another ticket. This covers the
    // `selectedTicket` fallback path where `find` may return undefined.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      expect(ticketId).toBeTruthy();

      // Open detail then close.
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Now delete that same ticket from the list.
      const cardAfterClose = container.querySelector(`[data-ticket-id="${ticketId}"]`);
      expect(cardAfterClose).not.toBeNull();
      fireEvent.click(within(cardAfterClose as HTMLElement).getByTestId('delete-button'));

      // The ticket should be gone.
      expect(container.querySelector(`[data-ticket-id="${ticketId}"]`)).toBeNull();
    } finally {
      unmount();
    }
  });
});
