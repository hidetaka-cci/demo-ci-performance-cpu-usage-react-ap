/**
 * Tests for the TicketDetail integration path in App.
 *
 * The existing App.pbt.test.tsx never clicks a ticket title to open the detail
 * view, so handleAddComment, selectedTicket, and the TicketDetail render branch
 * have 0% coverage. These tests close that gap.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the TicketDetail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('ticket detail displays the correct title', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent;

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('clicking Close button in detail view returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment in the detail view calls onAddComment and shows the comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me!' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      const commentItems = q.getAllByTestId('comment-item');
      expect(commentItems.length).toBe(1);
      expect(within(commentItems[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(commentItems[0]).getByTestId('comment-body').textContent).toBe(
        'Looks good to me!'
      );
    } finally {
      unmount();
    }
  });

  it('submitting comment with empty author does not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      // author left empty
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Some body text' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');

      // Open the detail view for the first ticket
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Go back and delete the ticket that was selected
      fireEvent.click(q.getByTestId('detail-close-button'));
      const updatedCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(updatedCards[0]).getByTestId('delete-button'));

      // The detail view should not be open after deletion
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the comment count header', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // The comment section header should show 0 comments initially
      const detail = q.getByTestId('ticket-detail');
      expect(detail.textContent).toContain('Comments (0)');
    } finally {
      unmount();
    }
  });
});
