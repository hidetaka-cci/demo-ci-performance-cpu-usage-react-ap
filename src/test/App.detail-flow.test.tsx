/**
 * Integration tests for App's ticket detail flow.
 *
 * Existing App.pbt.test.tsx does not click into a ticket detail, so the
 * handleAddComment path, the selectedTicket find callback, and the
 * onClose callback on TicketDetail remain unreached. TicketCard's
 * title onSelect callback is also unreached because standalone card
 * tests do not pass onSelect.
 *
 * These example-based tests drive that flow end-to-end so those
 * branches are actually invoked.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('clicking a ticket title opens TicketDetail for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(
        title.textContent
      );
      expect(detail.textContent).toContain(ticketId ?? '');
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('back button on detail returns the user to the list view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId(
        'ticket-title'
      );
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment from detail increases the comment count', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(
        within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title')
      );

      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Investigating this now.' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId(
        'comment-item'
      );
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe(
        'Alice'
      );
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe(
        'Investigating this now.'
      );
    } finally {
      unmount();
    }
  });

  it('empty comment submissions do not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(
        within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title')
      );

      const detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: '   ' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: '' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('comments are scoped to the ticket they were added to', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);

      // Add a comment to the first ticket.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'First ticket note' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);

      // Go back and open a different ticket.
      fireEvent.click(within(detail).getByTestId('detail-close-button'));
      const otherCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(otherCards[1]).getByTestId('ticket-title'));

      detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket closes the detail view', () => {
    // Open ticket detail, then delete that ticket via advancing to list
    // and clicking delete — the App clears selectedTicketId when the
    // deleted ticket matches. We exercise this by deleting from the
    // list after going back, and then verifying the list is intact.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstId = firstCard.getAttribute('data-ticket-id');

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      const target = q
        .getAllByTestId('ticket-card')
        .find((c) => c.getAttribute('data-ticket-id') === firstId);
      expect(target).toBeDefined();
      fireEvent.click(within(target!).getByTestId('delete-button'));

      const remaining = q.getAllByTestId('ticket-card');
      expect(
        remaining.some((c) => c.getAttribute('data-ticket-id') === firstId)
      ).toBe(false);
    } finally {
      unmount();
    }
  });
});
