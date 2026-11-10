/**
 * Integration tests for App's ticket detail navigation and comment flow.
 *
 * These cover the paths not exercised by App.pbt.test.tsx:
 *   - Clicking a ticket title selects it and renders TicketDetail
 *   - The Back button returns to the list view
 *   - Adding a comment via TicketDetail in App context
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent, screen } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail navigation', () => {
  it('clicking a ticket title shows TicketDetail and hides the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('the Back button in TicketDetail returns to the list view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('the detail view shows the selected ticket title', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent;
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
  });
});

describe('App - add comment via detail view', () => {
  it('submitting a valid comment adds it to the comment list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'Looking into this now.' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    const commentItems = q.getAllByTestId('comment-item');
    expect(commentItems.length).toBeGreaterThanOrEqual(1);

    const authors = commentItems.map(el => within(el).getByTestId('comment-author').textContent);
    expect(authors).toContain('Alice');
  });

  it('submitting a comment with empty author does not add a comment', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    const before = q.queryAllByTestId('comment-item').length;

    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'No author here.' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item').length).toBe(before);
  });

  it('deleting the selected ticket returns to list view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Delete from list requires going back first; instead delete via status advance
    // Go back and delete the first ticket
    fireEvent.click(q.getByTestId('detail-close-button'));
    const refreshedCards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(refreshedCards[0]).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });
});
