import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックするとTicketDetailが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('TicketDetailのBackボタンでチケットリストに戻る', () => {
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

  it('TicketDetailでコメントを追加するとコメントが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const dq = within(detail);

      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: 'This is a test comment.' } });
      fireEvent.click(dq.getByTestId('comment-submit-button'));

      expect(dq.getAllByTestId('comment-item')).toHaveLength(1);
      expect(dq.getByTestId('comment-author').textContent).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('複数のコメントを追加するとすべて表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');

      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const dq = within(detail);

      for (let i = 1; i <= 3; i++) {
        fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: `User${i}` } });
        fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: `Comment ${i}` } });
        fireEvent.click(dq.getByTestId('comment-submit-button'));
      }

      expect(dq.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });
});
