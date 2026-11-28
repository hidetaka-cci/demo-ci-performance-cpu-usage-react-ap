/**
 * Unit Tests for App - Ticket Detail View
 *
 * Covers the ticket detail view path (clicking a ticket title opens TicketDetail),
 * the handleAddComment function, and the selectedTicket/selectedComments computations.
 * These paths are not exercised by the existing PBT tests.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title opens the detail view and hides the list', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view displays the title of the selected ticket', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      const cards = q.getAllByTestId('ticket-card');
      const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent!;

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('detail view displays the description of the selected ticket', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      const cards = q.getAllByTestId('ticket-card');
      const expectedDesc = within(cards[0]).getByTestId('ticket-description').textContent!;

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-description').textContent).toBe(expectedDesc);
    } finally {
      unmount();
    }
  });

  it('close button in detail view returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view shows no comments initially for a fresh ticket', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('adding a valid comment in detail view shows the comment', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('submitting a comment with empty author does not add a comment', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Some body without author' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('adding multiple comments accumulates them in the detail view', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const submitComment = (author: string, body: string) => {
        const form = q.getByTestId('comment-form');
        fireEvent.change(within(form).getByTestId('comment-author-input'), {
          target: { value: author },
        });
        fireEvent.change(within(form).getByTestId('comment-body-input'), {
          target: { value: body },
        });
        fireEvent.click(within(form).getByTestId('comment-submit-button'));
      };

      submitComment('Alice', 'First comment');
      submitComment('Bob', 'Second comment');

      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('detail view comment section shows comment count', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail.textContent).toContain('Comments (0)');

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Hello' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.getByTestId('ticket-detail').textContent).toContain('Comments (1)');
    } finally {
      unmount();
    }
  });

  it('different tickets can be selected to show their own detail view', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    try {
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);

      const title0 = within(cards[0]).getByTestId('ticket-title').textContent!;
      const title1 = within(cards[1]).getByTestId('ticket-title').textContent!;

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('detail-title').textContent).toBe(title0);

      fireEvent.click(q.getByTestId('detail-close-button'));

      fireEvent.click(within(q.getAllByTestId('ticket-card')[1]).getByTestId('ticket-title'));
      expect(q.getByTestId('detail-title').textContent).toBe(title1);
    } finally {
      unmount();
    }
  });
});
