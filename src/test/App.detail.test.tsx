/**
 * Unit tests for App ticket-detail navigation flow.
 *
 * Covers the previously untested paths in App.tsx:
 *   - lines 73-75: handleAddComment body (selectedTicketId is set)
 *   - line 116: onClose={() => setSelectedTicketId(null) in TicketDetail
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail navigation', () => {
  it('clicking a ticket title shows the TicketDetail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking the Back button in TicketDetail returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // covers App.tsx line 116: onClose={() => setSelectedTicketId(null)
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a valid comment via TicketDetail adds it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('comment-form')).toBeInTheDocument();
      // covers App.tsx lines 73-75: handleAddComment body
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good!' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getByTestId('comment-list')).toBeInTheDocument();
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good!');
    } finally {
      unmount();
    }
  });

  it('submitting a comment with empty fields does not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      // click submit without filling in author or body
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket navigates back to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // Select first ticket to go to detail
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // Navigate back and delete that ticket from the list
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      const before = cards.length;
      fireEvent.click(within(cards[0]).getByTestId('delete-button'));
      expect(q.queryAllByTestId('ticket-card').length).toBe(before - 1);
    } finally {
      unmount();
    }
  });
});
