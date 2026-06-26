/**
 * Coverage gap tests for App.tsx
 *
 * Targets paths the existing PBT suite does not exercise:
 *   - Detail view open via ticket-title click and close via "← Back"
 *     (covers App.tsx onClose lambda at line 116).
 *   - handleAddComment happy path (App.tsx lines 72-76): a comment submitted
 *     from the detail view should appear in the rendered comment list.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view & comments (coverage gaps)', () => {
  it('opens the detail view on title click and returns to the list when ← Back is pressed', () => {
    render(<App />);

    // Initial render shows the ticket list, not the detail view.
    expect(screen.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    const cardsBefore = screen.getAllByTestId('ticket-card');
    expect(cardsBefore.length).toBeGreaterThan(0);

    // Click the first ticket title — TicketCard.onSelect → App.setSelectedTicketId.
    fireEvent.click(screen.getAllByTestId('ticket-title')[0]);

    // Detail view is now visible; the list is hidden.
    expect(screen.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(screen.queryAllByTestId('ticket-card')).toHaveLength(0);

    // Press Back — exercises App.tsx line 116 `onClose={() => setSelectedTicketId(null)}`.
    fireEvent.click(screen.getByTestId('detail-close-button'));

    // We are back on the list.
    expect(screen.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('ticket-card').length).toBe(cardsBefore.length);
  });

  it('submits a comment from the detail view and renders it in the comment list', () => {
    render(<App />);

    // Open the detail view.
    fireEvent.click(screen.getAllByTestId('ticket-title')[0]);
    expect(screen.getByTestId('ticket-detail')).toBeInTheDocument();

    // No comments yet.
    expect(screen.queryAllByTestId('comment-item')).toHaveLength(0);

    // Fill the comment form and submit — exercises App.tsx handleAddComment (72-76).
    fireEvent.change(screen.getByTestId('comment-author-input'), {
      target: { value: 'Reviewer' },
    });
    fireEvent.change(screen.getByTestId('comment-body-input'), {
      target: { value: 'Looks good to me' },
    });
    fireEvent.click(screen.getByTestId('comment-submit-button'));

    // The new comment is rendered.
    const items = screen.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(screen.getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(screen.getByTestId('comment-body').textContent).toBe('Looks good to me');
  });
});
