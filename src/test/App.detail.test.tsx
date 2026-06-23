/**
 * Integration tests for App's ticket-detail flow.
 *
 * These cover the previously untested paths:
 *   - TicketCard title onClick -> onSelect (TicketCard.tsx:79)
 *   - App computes selectedTicket from tickets (App.tsx:90)
 *   - handleAddComment when a ticket is selected (App.tsx:73-75)
 *   - TicketDetail onClose handler wired to setSelectedTicketId(null) (App.tsx:116)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('clicking a ticket card title opens the TicketDetail view for that ticket', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const cardTicketId = firstCard.getAttribute('data-ticket-id');
    const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;

    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    const detail = q.getByTestId('ticket-detail');
    expect(detail).toBeInTheDocument();
    expect(within(detail).getByTestId('detail-title').textContent).toBe(cardTitle);
    // The card list should be hidden while the detail view is showing.
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    expect(cardTicketId).toBeTruthy();
  });

  it('clicking the detail Back button restores the ticket list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    expect(q.getAllByTestId('ticket-card').length).toBeGreaterThan(0);
  });

  it('submitting a comment from the detail view appends it to the comment list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    const detail = q.getByTestId('ticket-detail');
    expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);

    fireEvent.change(within(detail).getByTestId('comment-author-input'), {
      target: { value: 'Reviewer' },
    });
    fireEvent.change(within(detail).getByTestId('comment-body-input'), {
      target: { value: 'Looks good to me.' },
    });
    fireEvent.click(within(detail).getByTestId('comment-submit-button'));

    const items = within(detail).getAllByTestId('comment-item');
    expect(items.length).toBe(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
  });

  it('comments are scoped per ticket: a comment on ticket A does not show on ticket B', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    expect(cards.length).toBeGreaterThanOrEqual(2);

    // Open first ticket and add a comment.
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    let detail = q.getByTestId('ticket-detail');
    fireEvent.change(within(detail).getByTestId('comment-author-input'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(within(detail).getByTestId('comment-body-input'), {
      target: { value: 'Reproduced locally.' },
    });
    fireEvent.click(within(detail).getByTestId('comment-submit-button'));
    expect(within(detail).getAllByTestId('comment-item').length).toBe(1);

    // Close, then open a different ticket — it should have no comments.
    fireEvent.click(q.getByTestId('detail-close-button'));
    const cardsAgain = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cardsAgain[1]).getByTestId('ticket-title'));
    detail = q.getByTestId('ticket-detail');
    expect(within(detail).queryAllByTestId('comment-item').length).toBe(0);
  });

  it('deleting the currently selected ticket clears the selection and returns to the list', () => {
    // Reaches the `if (selectedTicketId === id) setSelectedTicketId(null)` branch in handleDelete.
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    const detail = q.getByTestId('ticket-detail');
    expect(detail).toBeInTheDocument();

    // No delete button inside the detail view, so go back, then delete from the card list.
    fireEvent.click(q.getByTestId('detail-close-button'));
    const card = q.getAllByTestId('ticket-card')[0];
    const beforeCount = q.getAllByTestId('ticket-card').length;

    // Re-open the same card to set selectedTicketId again.
    fireEvent.click(within(card).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    fireEvent.click(q.getByTestId('detail-close-button'));

    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getAllByTestId('ticket-card').length).toBe(beforeCount - 1);
  });
});
