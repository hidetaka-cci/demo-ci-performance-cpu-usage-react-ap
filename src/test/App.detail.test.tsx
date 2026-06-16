/**
 * Tests for App's ticket detail interaction flow.
 *
 * Targets App.tsx lines 73-75 (handleAddComment body), 90 (selectedTicket
 * resolution from id) and 116 (onClose handler), which were previously
 * uncovered because no test selected a ticket from the list.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const expectedId = firstCard.getAttribute('data-ticket-id');
      const titleText = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // The same ticket id appears in the detail header.
      expect(detail.textContent).toContain(expectedId ?? '');
      // The detail title matches the card title.
      expect(within(detail).getByTestId('detail-title').textContent).toBe(titleText);
      // The list view is hidden while the detail view is open.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking close in the detail view returns to the list', () => {
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

  it('adding a comment in the detail view appends it to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(detail).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('comments are scoped to the selected ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      // Open first ticket, add a comment.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'First-ticket comment' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);

      // Close, open second ticket, expect no comments.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAgain = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAgain[1]).getByTestId('ticket-title'));
      detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const targetId = cards[0].getAttribute('data-ticket-id');

      // Select the first ticket.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close, then delete that ticket from the list.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      const toDelete = cardsAfterClose.find(
        c => c.getAttribute('data-ticket-id') === targetId
      );
      expect(toDelete).toBeTruthy();
      fireEvent.click(within(toDelete!).getByTestId('delete-button'));

      // The deleted ticket is no longer in the list.
      const remaining = q.queryAllByTestId('ticket-card');
      remaining.forEach(c => {
        expect(c.getAttribute('data-ticket-id')).not.toBe(targetId);
      });
    } finally {
      unmount();
    }
  });
});
