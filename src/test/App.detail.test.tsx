/**
 * Unit tests for App ticket detail view flow.
 *
 * Targets uncovered lines in App.tsx:
 *  - Lines 73-75: handleAddComment body (requires selectedTicketId to be set)
 *  - Line 90: selectedTicket calculation when selectedTicketId is non-null
 *  - Line 116: TicketDetail component render
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックするとdetailビューが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detailビューのBackボタンでticketリストに戻る', () => {
    const { unmount, container } = render(<App />);
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

  it('detailビューからコメントを追加するとコメントが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'This is a test comment.' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);
    } finally {
      unmount();
    }
  });

  it('detail表示中にdetailのチケット情報が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstTitle = within(cards[0]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(firstTitle);
    } finally {
      unmount();
    }
  });
});
