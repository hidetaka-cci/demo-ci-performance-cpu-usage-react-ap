/**
 * Unit tests for App's ticket detail view flow.
 *
 * The PBT suite never clicks ticket titles, so the following App.tsx lines
 * are uncovered by existing tests:
 *   - 73-75: handleAddComment (only reachable when selectedTicketId is set)
 *   - 90: truthy branch of selectedTicket useMemo (requires selectedTicketId)
 *   - 116: onClose={() => setSelectedTicketId(null)} passed to TicketDetail
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

  it('the detail view shows the correct ticket title', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstTitle = q.getAllByTestId('ticket-title')[0].textContent;
    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    expect(q.getByTestId('detail-title').textContent).toBe(firstTitle);
  });

  it('clicking the Back button closes the detail view and returns to list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('submitting a comment in the detail view adds it to the comment list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(1);
    expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me');
  });

  it('adding multiple comments accumulates them in the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);

    for (let i = 1; i <= 3; i++) {
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: `User${i}` } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: `Comment ${i}` } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
    }

    expect(q.queryAllByTestId('comment-item')).toHaveLength(3);
  });

  it('deleting the selected ticket while in detail view closes the detail', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});
