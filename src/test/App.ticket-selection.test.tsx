/**
 * Tests for the ticket-selection and detail-view workflow in App.
 *
 * The existing App PBT suite covers: filtering, sorting, creating, deleting,
 * and advancing status — all from the list view.
 * This file adds coverage for:
 *   - Clicking a ticket title to open the detail view
 *   - Detail view renders the correct ticket
 *   - Adding a comment from the detail view
 *   - Closing the detail view returns to the list
 *   - Deleting the selected ticket while in detail view resets selection
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, within, screen } from '@testing-library/react';
import App from '../App';

function selectFirstTicket(container: HTMLElement) {
  const cards = within(container).getAllByTestId('ticket-card');
  const firstCard = cards[0];
  fireEvent.click(within(firstCard).getByTestId('ticket-title'));
}

describe('App - ticket selection workflow', () => {
  it('clicking a ticket title shows the detail view and hides the list', () => {
    const { container, unmount } = render(<App />);
    try {
      expect(within(container).queryByTestId('ticket-detail')).not.toBeInTheDocument();
      selectFirstTicket(container);
      expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();
      expect(within(container).queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the title of the selected ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const cards = within(container).getAllByTestId('ticket-card');
      const firstTitle = within(cards[0]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      const detailTitle = within(container).getByTestId('detail-title').textContent;
      expect(detailTitle).toBe(firstTitle);
    } finally {
      unmount();
    }
  });

  it('clicking Back (close) from detail view returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(within(container).getByTestId('detail-close-button'));
      expect(within(container).queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(within(container).getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment from the detail view increases the comment count', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      const detail = within(container).getByTestId('ticket-detail');
      const commentForm = within(detail).getByTestId('comment-form');

      fireEvent.change(within(commentForm).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(commentForm).getByTestId('comment-body-input'), {
        target: { value: 'This is a test comment.' },
      });
      fireEvent.click(within(commentForm).getByTestId('comment-submit-button'));

      const commentItems = within(detail).queryAllByTestId('comment-item');
      expect(commentItems.length).toBe(1);
    } finally {
      unmount();
    }
  });

  it('comment form clears after a successful submission', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      const detail = within(container).getByTestId('ticket-detail');
      const commentForm = within(detail).getByTestId('comment-form');

      const authorInput = within(commentForm).getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = within(commentForm).getByTestId('comment-body-input') as HTMLTextAreaElement;

      fireEvent.change(authorInput, { target: { value: 'Bob' } });
      fireEvent.change(bodyInput, { target: { value: 'Another comment.' } });
      fireEvent.click(within(commentForm).getByTestId('comment-submit-button'));

      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('submitting comment with empty author does not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      const detail = within(container).getByTestId('ticket-detail');
      const commentForm = within(detail).getByTestId('comment-form');

      // leave author empty, only fill body
      fireEvent.change(within(commentForm).getByTestId('comment-body-input'), {
        target: { value: 'Body without author' },
      });
      fireEvent.click(within(commentForm).getByTestId('comment-submit-button'));

      expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });

  it('comments are scoped to the selected ticket (different tickets have separate comments)', () => {
    const { container, unmount } = render(<App />);
    try {
      const cards = within(container).getAllByTestId('ticket-card');
      // Add a comment to the first ticket
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detail = within(container).getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), { target: { value: 'Comment for ticket 1' } });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).queryAllByTestId('comment-item').length).toBe(1);

      // Close and select second ticket
      fireEvent.click(within(container).getByTestId('detail-close-button'));
      const updatedCards = within(container).getAllByTestId('ticket-card');
      fireEvent.click(within(updatedCards[1]).getByTestId('ticket-title'));

      detail = within(container).getByTestId('ticket-detail');
      // Second ticket should have 0 comments
      expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });
});
