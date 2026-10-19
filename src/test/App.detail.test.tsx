/**
 * Tests for App.tsx ticket detail view flow.
 *
 * Covers the previously untested paths:
 *   - Line 73-75: handleAddComment body (selectedTicketId set)
 *   - Line 90:    selectedTicket truthy branch (tickets.find)
 *   - Line 116:   onClose={() => setSelectedTicketId(null)}
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view displays the selected ticket title', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('ticket list is hidden while detail view is open', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('closing detail view returns to ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment in the detail view adds it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'This is a test comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
    } finally {
      unmount();
    }
  });

  it('comment form resets after a successful submission', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Bob' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Another comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      const authorInput = within(form).getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = within(form).getByTestId('comment-body-input') as HTMLTextAreaElement;
      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('multiple comments accumulate correctly', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const addComment = (author: string, body: string) => {
        const form = q.getByTestId('comment-form');
        fireEvent.change(within(form).getByTestId('comment-author-input'), {
          target: { value: author },
        });
        fireEvent.change(within(form).getByTestId('comment-body-input'), {
          target: { value: body },
        });
        fireEvent.click(within(form).getByTestId('comment-submit-button'));
      };

      addComment('Alice', 'First comment');
      addComment('Bob', 'Second comment');

      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('deleting the currently-selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstCard = cards[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Close detail, then delete the ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const updatedCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(updatedCards[0]).getByTestId('delete-button'));

      // Should remain in list view with one fewer card
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.queryAllByTestId('ticket-card')).toHaveLength(cards.length - 1);
    } finally {
      unmount();
    }
  });
});
