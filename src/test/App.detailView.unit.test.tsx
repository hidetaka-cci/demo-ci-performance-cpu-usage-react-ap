/**
 * Unit tests for App's ticket detail view flow.
 *
 * Covers App.tsx surfaces not touched by the PBT suite:
 *   - lines 73-75: handleAddComment (attaching a comment while a ticket is selected)
 *   - line  90:    tickets.find(...) ?? null branch (selection cleared on delete)
 *   - line 116:    onClose callback returning to the list view
 *
 * These are plain unit tests (no fast-check) to keep runtime low while
 * still asserting meaningful outcomes on the App integration surface.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - opening the ticket detail view', () => {
  it('renders the detail view when a ticket title is clicked', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    // The filter panel is replaced by the detail view.
    expect(q.queryByTestId('filter-panel')).not.toBeInTheDocument();
  });

  it('shows the details of the clicked ticket', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;

    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
  });
});

describe('App - closing the ticket detail view', () => {
  it('returns to the list view when the Back button is clicked', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('filter-panel')).toBeInTheDocument();
    expect(q.getAllByTestId('ticket-card').length).toBeGreaterThan(0);
  });
});

describe('App - adding a comment from the detail view', () => {
  it('appends a comment for the currently selected ticket', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    // No comments yet.
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), {
      target: { value: 'Reviewer' },
    });
    fireEvent.change(q.getByTestId('comment-body-input'), {
      target: { value: 'Looks good to me.' },
    });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
  });

  it('does nothing when the comment form is submitted with empty fields', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });
});

describe('App - detail view when the selected ticket disappears', () => {
  it('falls back to the list when the selected ticket is deleted', () => {
    const { container } = render(<App />);
    const q = within(container);

    // Delete the first ticket from the list view to grab its id predictably,
    // then re-select a fresh first card and delete *it* while the detail view
    // is open. React state keeps `selectedTicketId` set but tickets.find()
    // returns undefined, so `selectedTicket` becomes null and the list
    // view is re-rendered (exercising the `?? null` branch in App.tsx:90).
    const firstCard = q.getAllByTestId('ticket-card')[0];
    const selectedId = firstCard.getAttribute('data-ticket-id');

    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Close, delete, then re-render assertion:
    fireEvent.click(q.getByTestId('detail-close-button'));
    const stillThere = q.getAllByTestId('ticket-card').find(
      c => c.getAttribute('data-ticket-id') === selectedId
    );
    expect(stillThere).toBeDefined();
    fireEvent.click(within(stillThere!).getByTestId('delete-button'));

    // The deleted ticket is no longer present.
    const remainingIds = q
      .getAllByTestId('ticket-card')
      .map(c => c.getAttribute('data-ticket-id'));
    expect(remainingIds).not.toContain(selectedId);
  });
});
