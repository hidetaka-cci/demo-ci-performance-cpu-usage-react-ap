/**
 * Coverage-oriented tests for App component.
 *
 * These tests exercise the ticket-detail view flow which the PBT suite does
 * not touch:
 *   - Opening the detail view by clicking a ticket title (TicketCard onSelect)
 *   - Adding a comment while a ticket is selected (App handleAddComment)
 *   - Closing the detail view (App setSelectedTicketId(null))
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view flow', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a valid comment appends it to the detail comment list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const authorInput = within(detail).getByTestId('comment-author-input');
      const bodyInput = within(detail).getByTestId('comment-body-input');

      fireEvent.change(authorInput, { target: { value: 'Reviewer' } });
      fireEvent.change(bodyInput, { target: { value: 'Looks good to me' } });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(detail).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('submitting a comment with empty author does not add a comment', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-body-input'), { target: { value: 'no author' } });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('clicking the detail Back button returns to the list view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding multiple comments preserves them all in the detail view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const authorInput = within(detail).getByTestId('comment-author-input');
      const bodyInput = within(detail).getByTestId('comment-body-input');
      const submit = within(detail).getByTestId('comment-submit-button');

      fireEvent.change(authorInput, { target: { value: 'Alice' } });
      fireEvent.change(bodyInput, { target: { value: 'First' } });
      fireEvent.click(submit);

      fireEvent.change(authorInput, { target: { value: 'Bob' } });
      fireEvent.change(bodyInput, { target: { value: 'Second' } });
      fireEvent.click(submit);

      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });
});
