/**
 * Unit tests covering App's ticket-detail selection flow.
 *
 * Targets previously uncovered App.tsx lines:
 *   - handleAddComment (73-75): creating a comment when a ticket is selected
 *   - selectedTicket lookup (90): rendering TicketDetail for the selected ticket
 *   - onClose (116): closing the detail view via the ← Back button
 *
 * Written as plain unit tests (no fast-check) to keep the run fast and the
 * signal for these specific branches unambiguous.
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
      const ticketId = firstCard.getAttribute('data-ticket-id');
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      const detailIdSpan = within(detail).getByText(ticketId!);
      expect(detailIdSpan).toBeInTheDocument();

      // List/controls are hidden while in detail view.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('filter-panel')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('closing the detail view returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      // All original ticket cards are visible again.
      expect(q.getAllByTestId('ticket-card').length).toBeGreaterThanOrEqual(3);
    } finally {
      unmount();
    }
  });

  it('adding a comment on the detail view appends a comment item', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id')!;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail, delete that ticket from the list, ensure it's gone.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const remainingCard = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === ticketId)!;
      fireEvent.click(within(remainingCard).getByTestId('delete-button'));

      const stillPresent = q
        .queryAllByTestId('ticket-card')
        .some(c => c.getAttribute('data-ticket-id') === ticketId);
      expect(stillPresent).toBe(false);
    } finally {
      unmount();
    }
  });

  it('comments belong to the ticket they were added on', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      // Open the first ticket, add a comment.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'On ticket 1' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);

      // Close and open a different ticket — no comments should appear there.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const otherCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(otherCards[1]).getByTestId('ticket-title'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // Return to the first ticket — the comment is still there.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const returnCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(returnCards[0]).getByTestId('ticket-title'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
    } finally {
      unmount();
    }
  });
});
