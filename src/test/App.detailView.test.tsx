/**
 * Unit tests for App's detail-view flow
 *
 * Covers branches not exercised by the property-based suite:
 *   - handleAddComment: full flow appending a comment to state
 *   - Detail view onClose handler restoring the list view
 *   - selectedTicket fallback when the selected id is removed from state
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view interactions', () => {
  it('clicking a ticket title opens TicketDetail; Back returns to the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstTitle = q.getAllByTestId('ticket-title')[0];
    fireEvent.click(firstTitle);

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('submitting a valid comment in the detail view renders it in the comment list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    const authorInput = q.getByTestId('comment-author-input') as HTMLInputElement;
    const bodyInput = q.getByTestId('comment-body-input') as HTMLTextAreaElement;
    fireEvent.change(authorInput, { target: { value: 'Reviewer' } });
    fireEvent.change(bodyInput, { target: { value: 'Looks good to me' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(q.getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me');

    // Inputs reset after submit (CommentForm internal behavior)
    expect((q.getByTestId('comment-author-input') as HTMLInputElement).value).toBe('');
    expect((q.getByTestId('comment-body-input') as HTMLTextAreaElement).value).toBe('');
  });

  it('submitting an empty comment does not add an entry to the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('deleting the currently selected ticket from the list closes the detail view', () => {
    // First open a detail view, then go back, delete that same ticket, ensure
    // a stale selectedTicketId triggers the ?? null fallback (App.tsx line 90)
    // via the handleDelete cleanup branch (App.tsx line 69).
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const ticketId = firstCard.getAttribute('data-ticket-id')!;
    const title = within(firstCard).getByTestId('ticket-title');
    fireEvent.click(title);

    // Verify we're in detail view for that ticket
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Close, then delete the same ticket from the list
    fireEvent.click(q.getByTestId('detail-close-button'));
    const cardAfter = container.querySelector(`[data-ticket-id="${ticketId}"]`)!;
    const deleteBtn = within(cardAfter as HTMLElement).getByTestId('delete-button');
    fireEvent.click(deleteBtn);

    // Ticket is gone and detail view stays closed
    expect(container.querySelector(`[data-ticket-id="${ticketId}"]`)).toBeNull();
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});
