/**
 * Coverage-targeted tests for App detail-view flow.
 *
 * Targets previously-uncovered lines in src/App.tsx:
 *   - lines 73-75: handleAddComment (createComment + addComment)
 *   - line 90:      tickets.find(...) selectedTicket resolution
 *   - line 116:     onClose -> setSelectedTicketId(null)
 *
 * These paths are only reachable via TicketCard title click → TicketDetail
 * (open detail), then interacting with the comment form and close button.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

const openFirstTicketDetail = (container: HTMLElement) => {
  const q = within(container);
  const firstCard = q.getAllByTestId('ticket-card')[0];
  const title = within(firstCard).getByTestId('ticket-title');
  fireEvent.click(title);
  return q.getByTestId('ticket-detail');
};

describe('App - detail view flow (coverage)', () => {
  it('clicking a ticket title opens the detail view with matching title', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('opening the detail view hides the filter/new-ticket controls', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();

      openFirstTicketDetail(container);

      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
      expect(q.queryByTestId('search-input')).not.toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a valid comment renders it in the detail view comment list', () => {
    const { unmount, container } = render(<App />);
    try {
      const detail = openFirstTicketDetail(container);
      const d = within(detail);

      expect(d.queryByTestId('comment-list')).not.toBeInTheDocument();

      fireEvent.change(d.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(d.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(d.getByTestId('comment-submit-button'));

      const list = d.getByTestId('comment-list');
      const items = within(list).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('adding multiple comments accumulates them and updates the count header', () => {
    const { unmount, container } = render(<App />);
    try {
      const detail = openFirstTicketDetail(container);
      const d = within(detail);

      const submit = (author: string, body: string) => {
        fireEvent.change(d.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(d.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(d.getByTestId('comment-submit-button'));
      };

      submit('Alice', 'First');
      submit('Bob', 'Second');
      submit('Carol', 'Third');

      const items = within(d.getByTestId('comment-list')).getAllByTestId('comment-item');
      expect(items).toHaveLength(3);
      expect(detail.textContent).toContain('Comments (3)');
    } finally {
      unmount();
    }
  });

  it('closing the detail view returns to the ticket list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const detail = openFirstTicketDetail(container);

      fireEvent.click(within(detail).getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('comments persist when detail is reopened for the same ticket', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      let detail = openFirstTicketDetail(container);
      let d = within(detail);

      fireEvent.change(d.getByTestId('comment-author-input'), { target: { value: 'Persistent' } });
      fireEvent.change(d.getByTestId('comment-body-input'), { target: { value: 'Still here' } });
      fireEvent.click(d.getByTestId('comment-submit-button'));

      fireEvent.click(d.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      detail = openFirstTicketDetail(container);
      d = within(detail);

      const items = within(d.getByTestId('comment-list')).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Still here');
    } finally {
      unmount();
    }
  });

  it('reopening the detail for a different ticket shows that ticket', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const [firstCard, secondCard] = cards;

      const firstTitle = within(firstCard).getByTestId('ticket-title').textContent;
      const secondTitle = within(secondCard).getByTestId('ticket-title').textContent;
      expect(firstTitle).not.toBe(secondTitle);

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      let detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(firstTitle);

      fireEvent.click(within(detail).getByTestId('detail-close-button'));

      const refreshedSecond = q.getAllByTestId('ticket-card').find(
        c => within(c).getByTestId('ticket-title').textContent === secondTitle,
      )!;
      fireEvent.click(within(refreshedSecond).getByTestId('ticket-title'));
      detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(secondTitle);
    } finally {
      unmount();
    }
  });
});
