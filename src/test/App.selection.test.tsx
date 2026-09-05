/**
 * Tests for App ticket-selection & comment flow
 *
 * Covers previously uncovered branches in App.tsx:
 *   - the ticket selection lookup (tickets.find on line 90)
 *   - handleAddComment (lines 72-76) creating and storing a comment
 *   - onClose callback (line 116) clearing selectedTicketId
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket selection & detail flow', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('detail view shows the selected ticket title and description', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstCard = cards[0];
      const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;
      const expectedDesc = within(firstCard).getByTestId('ticket-description').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
      expect(q.getByTestId('detail-description').textContent).toBe(expectedDesc);
    } finally {
      unmount();
    }
  });

  it('clicking Back returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment via the detail view renders it and clears the form', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const authorInput = q.getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = q.getByTestId('comment-body-input') as HTMLTextAreaElement;

      fireEvent.change(authorInput, { target: { value: 'Reviewer' } });
      fireEvent.change(bodyInput, { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');

      // Form is cleared after submission
      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('empty comment submissions are ignored', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('multiple comments accumulate and persist across Back/reopen', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      const ticketCard = firstTitle.closest('[data-testid="ticket-card"]') as HTMLElement;
      const ticketId = ticketCard.getAttribute('data-ticket-id');
      fireEvent.click(firstTitle);

      const submit = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };

      submit('Alice', 'first');
      submit('Bob', 'second');
      expect(q.getAllByTestId('comment-item')).toHaveLength(2);

      fireEvent.click(q.getByTestId('detail-close-button'));
      // Reopen the same ticket by id — comments should still be there
      const reopenCard = container.querySelector(
        `[data-testid="ticket-card"][data-ticket-id="${ticketId}"]`
      ) as HTMLElement;
      fireEvent.click(within(reopenCard).getByTestId('ticket-title'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('selecting a different ticket after closing the first shows the new detail', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      const firstText = titles[0].textContent;
      const secondText = titles[1].textContent;
      expect(firstText).not.toBe(secondText);

      fireEvent.click(titles[0]);
      expect(q.getByTestId('detail-title').textContent).toBe(firstText);
      fireEvent.click(q.getByTestId('detail-close-button'));

      const titlesAgain = q.getAllByTestId('ticket-title');
      const nextTarget = titlesAgain.find(t => t.textContent === secondText)!;
      fireEvent.click(nextTarget);
      expect(q.getByTestId('detail-title').textContent).toBe(secondText);
    } finally {
      unmount();
    }
  });
});
