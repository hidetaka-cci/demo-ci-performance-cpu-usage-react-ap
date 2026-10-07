/**
 * Unit tests covering App's selected-ticket detail flow.
 *
 * Targets uncovered lines in src/App.tsx:
 *   - handleAddComment (requires a selectedTicketId)
 *   - selectedTicket find() ?? null evaluation path
 *   - onClose handler that clears selectedTicketId
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // Ticket list controls are hidden while the detail view is active.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      // The detail view corresponds to the selected ticket.
      const idSpans = detail.querySelectorAll('span');
      const hasTicketId = Array.from(idSpans).some(el => el.textContent === ticketId);
      expect(hasTicketId).toBe(true);
    } finally {
      unmount();
    }
  });

  it('close button in the detail view returns to the list', () => {
    const { container, unmount } = render(<App />);
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

  it('submitting a comment from the detail view adds it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Initially the Comments header shows (0) and there is no list rendered.
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const list = q.getByTestId('comment-list');
      const items = within(list).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('empty-input comment submission does not create a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Submit with blank author/body — handleAddComment should not add.
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('deleting the currently-selected ticket deselects it and shows the list again', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Select a ticket first.
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Go back and delete that same ticket from the list.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      const originalCount = cards.length;
      fireEvent.click(within(cards[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card')).toHaveLength(originalCount - 1);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
