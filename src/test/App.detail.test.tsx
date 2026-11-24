/**
 * Tests for App's ticket detail view flow.
 *
 * Covers previously uncovered lines:
 *   - App.tsx lines 73-75: handleAddComment body
 *   - App.tsx line 90:     selectedTicket ternary true-branch (find executes)
 *   - App.tsx line 116:    onClose lambda (setSelectedTicketId(null))
 *   - TicketCard.tsx line 79: onSelect?.(ticket.id) onClick handler
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('detail view displays the selected ticket title', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent;

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
  });

  it('close button returns to the ticket list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('adding a valid comment creates a comment item in the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good!' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.getAllByTestId('comment-item')).toHaveLength(1);
    expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    expect(q.getByTestId('comment-body').textContent).toBe('Looks good!');
  });

  it('submitting a comment with empty author does not add a comment', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Some text' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });
});
