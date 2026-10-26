import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title opens detail view and hides ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking Back button from detail view restores ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment in detail view shows the comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Tester' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Tester');
    } finally {
      unmount();
    }
  });
});
