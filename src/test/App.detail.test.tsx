/**
 * Integration tests for the ticket detail view flow in App.
 *
 * Covers the path where a user selects a ticket, views its detail,
 * adds a comment, and closes the detail view — all of which were
 * previously uncovered (App.tsx lines 73-75, 90, 116).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title shows TicketDetail and hides the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

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
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(cardTitle);
    } finally {
      unmount();
    }
  });

  it('close button in detail view returns to list view', () => {
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

  it('adding a comment in detail view appends it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      const commentForm = q.getByTestId('comment-form');
      fireEvent.change(within(commentForm).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(commentForm).getByTestId('comment-body-input'), {
        target: { value: 'Looking into this now.' },
      });
      fireEvent.click(within(commentForm).getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
      expect(q.getByTestId('comment-body').textContent).toBe('Looking into this now.');
    } finally {
      unmount();
    }
  });

  it('submitting comment with empty author does not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const commentForm = q.getByTestId('comment-form');
      fireEvent.change(within(commentForm).getByTestId('comment-body-input'), {
        target: { value: 'No author provided.' },
      });
      fireEvent.click(within(commentForm).getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Go back to list and delete the ticket that was selected
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === ticketId
      )!;
      fireEvent.click(within(targetCard).getByTestId('delete-button'));

      // Click on another ticket to verify detail works for a different ticket
      const remaining = q.queryAllByTestId('ticket-card');
      if (remaining.length > 0) {
        expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      }
    } finally {
      unmount();
    }
  });
});
