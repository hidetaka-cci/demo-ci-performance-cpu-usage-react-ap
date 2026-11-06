/**
 * Coverage-gap tests for App component - ticket detail view flow.
 *
 * The PBT suite never clicks ticket titles, so handleAddComment (lines 73-75),
 * the selectedTicket computation (line 90), and the onClose callback (line 116)
 * were all uncovered. These deterministic tests cover those paths directly.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title opens TicketDetail', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking the Back button in TicketDetail returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a valid comment in TicketDetail adds it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('the ticket detail displays the correct ticket title', () => {
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
});
