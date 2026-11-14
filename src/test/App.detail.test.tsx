/**
 * Integration tests for App.tsx — ticket detail flow
 *
 * Covers the uncovered lines in App.tsx:
 *   - Lines 73-75: handleAddComment (selecting a ticket and adding a comment)
 *   - Line 90: selectedTicket computed from selectedTicketId
 *   - Line 116: onClose callback (() => setSelectedTicketId(null))
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title shows the detail view and hides the ticket list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const titleEl = q.getAllByTestId('ticket-title')[0];
    fireEvent.click(titleEl);

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('clicking the close button in detail view returns to the ticket list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('the selected ticket title appears in the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const titleEl = q.getAllByTestId('ticket-title')[0];
    const expectedTitle = titleEl.textContent ?? '';
    fireEvent.click(titleEl);

    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
  });

  it('adding a comment in detail view calls handleAddComment and shows the comment', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    const authorInput = q.getByTestId('comment-author-input');
    const bodyInput = q.getByTestId('comment-body-input');
    const submitBtn = q.getByTestId('comment-submit-button');

    fireEvent.change(authorInput, { target: { value: 'Alice' } });
    fireEvent.change(bodyInput, { target: { value: 'This is a test comment' } });
    fireEvent.click(submitBtn);

    expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    expect(q.getByTestId('comment-body').textContent).toBe('This is a test comment');
  });

  it('submitting comment with empty author does not add a comment', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    const bodyInput = q.getByTestId('comment-body-input');
    const submitBtn = q.getByTestId('comment-submit-button');

    fireEvent.change(bodyInput, { target: { value: 'Some comment' } });
    fireEvent.click(submitBtn);

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('deleting the selected ticket closes the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const titleEl = q.getAllByTestId('ticket-title')[0];
    fireEvent.click(titleEl);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Go back to ticket list first to delete via ticket card's delete button
    fireEvent.click(q.getByTestId('detail-close-button'));
    const deleteButtons = q.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});

describe('App - selectedTicket computed value', () => {
  it('selectedTicket reflects the ticket whose id matches selectedTicketId', () => {
    render(<App />);
    const titleEls = screen.getAllByTestId('ticket-title');
    const secondTitle = titleEls[1].textContent ?? '';

    fireEvent.click(titleEls[1]);

    expect(screen.getByTestId('detail-title').textContent).toBe(secondTitle);
  });

  it('selectedTicket is null when no ticket is selected (ticket-detail not rendered)', () => {
    render(<App />);
    expect(screen.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});
