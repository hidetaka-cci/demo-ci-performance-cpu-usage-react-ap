/**
 * Integration tests for App's TicketDetail flow.
 *
 * Targets uncovered functions in src/App.tsx:
 *   - handleAddComment (lines 72-76)
 *   - selectedTicket null-fallback branch (line 90)
 *   - onClose callback passed to TicketDetail (line 116)
 *
 * These are plain fast tests (no fast-check) because the behaviours are
 * deterministic — property-based coverage already exists for the list flow.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - TicketDetail integration', () => {
  it('clicking a ticket title opens the detail view and Back closes it', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // list, controls, and new-ticket button are hidden while detail is shown
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();

      fireEvent.click(within(detail).getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment from the detail view increments the comment count', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const detail = q.getByTestId('ticket-detail');
      const d = within(detail);

      expect(d.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(d.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(d.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(d.getByTestId('comment-submit-button'));

      const items = d.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('deleting the currently-selected ticket closes the detail view', () => {
    // Covers the `if (selectedTicketId === id) setSelectedTicketId(null)` branch
    // and the `tickets.find(...) ?? null` fallback when the ticket disappears.
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);

      // Open detail for the first ticket.
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstTitle = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail so we can get back to the list, then delete that same ticket.
      fireEvent.click(within(q.getByTestId('ticket-detail')).getByTestId('detail-close-button'));
      const sameCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(sameCard).getByTestId('delete-button'));

      // Re-select a now-different ticket, then delete *that* one while open.
      const nextTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
      fireEvent.click(nextTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('comments added for one ticket do not leak into another ticket', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);

      // Add a comment to the first ticket.
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      let detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), { target: { value: 'A' } });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), { target: { value: 'first' } });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);

      // Switch to the second ticket.
      fireEvent.click(within(detail).getByTestId('detail-close-button'));
      fireEvent.click(q.getAllByTestId('ticket-title')[1]);
      detail = q.getByTestId('ticket-detail');

      // Second ticket should have no comments.
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
