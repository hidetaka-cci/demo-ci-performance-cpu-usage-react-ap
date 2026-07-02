/**
 * Regression tests for the ticket detail view flow in App.
 *
 * Targets uncovered branches in App.tsx and TicketCard.tsx:
 *   - App.tsx L73-75: handleAddComment persists a new comment when a ticket is selected
 *   - App.tsx L90:    tickets.find(...) for the selected ticket id
 *   - App.tsx L116:   onClose callback closes the detail view
 *   - TicketCard.tsx L79: onSelect handler fires when the ticket title is clicked
 *
 * These are not PBT tests: each exercises a specific integration path once.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      const titleText = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(titleText);
      expect(detail.textContent).toContain(ticketId);
    } finally {
      unmount();
    }
  });

  it('clicking the detail close button returns to the list view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();

      fireEvent.click(within(detail).getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment in the detail view appends it to the comment list', () => {
    const { unmount, container } = render(<App />);
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

  it('comments added on one ticket do not leak into another ticket detail view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');

      // Open first ticket and add a comment
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'On ticket 1' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);

      // Close detail, open a different ticket, and confirm its comment list is empty
      fireEvent.click(within(detail).getByTestId('detail-close-button'));
      const cards2 = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards2[1]).getByTestId('ticket-title'));
      detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
