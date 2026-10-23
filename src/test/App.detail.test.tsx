/**
 * Unit tests for App ticket detail flow (select, comment, close).
 *
 * Covers:
 *   - App.tsx handleAddComment (lines 73-75)
 *   - App.tsx selectedTicket expression (line 90)
 *   - App.tsx onClose callback in TicketDetail (line 116)
 *   - TicketCard.tsx onSelect click handler (line 79)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title opens the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('closing the detail view returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows the selected ticket title', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cardTitle = q.getAllByTestId('ticket-title')[0];
      const titleText = cardTitle.textContent ?? '';

      fireEvent.click(cardTitle);

      expect(q.getByTestId('detail-title').textContent).toBe(titleText);
    } finally {
      unmount();
    }
  });

  it('adding a comment in the detail view creates a comment item', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Tester' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'This is a test comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const comments = q.getAllByTestId('comment-item');
      expect(comments).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Tester');
      expect(q.getByTestId('comment-body').textContent).toBe('This is a test comment');
    } finally {
      unmount();
    }
  });

  it('comment form clears after a successful submission', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const authorInput = q.getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = q.getByTestId('comment-body-input') as HTMLTextAreaElement;

      fireEvent.change(authorInput, { target: { value: 'Alice' } });
      fireEvent.change(bodyInput, { target: { value: 'Some text' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });
});
