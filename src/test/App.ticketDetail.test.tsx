import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title opens the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstTitle = within(cards[0]).getByTestId('ticket-title');
      const titleText = firstTitle.textContent ?? '';

      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.getByTestId('detail-title').textContent).toBe(titleText);
    } finally {
      unmount();
    }
  });

  it('detail view hides the filter panel and ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.queryByTestId('filter-panel')).not.toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('Close (Back) button in detail view returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment in detail view does not crash the app', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'This is a test comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryAllByTestId('comment-item')).toHaveLength(1);
    } finally {
      unmount();
    }
  });

  it('deleting the selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstCard = cards[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Delete the selected ticket (requires going back first since detail is showing)
      fireEvent.click(q.getByTestId('detail-close-button'));
      const updatedCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(updatedCards[0]).getByTestId('delete-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
