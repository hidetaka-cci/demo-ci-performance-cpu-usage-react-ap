/**
 * Coverage tests for App ticket-detail flow (App.tsx lines 73-75, 90, 116).
 *
 * The existing PBT integration tests never click a ticket title, so the entire
 * TicketDetail view path is uncovered:
 *   - Line 90:  `selectedTicketId ? tickets.find(...) ?? null : null` (true branch)
 *   - Line 116: `onClose={() => setSelectedTicketId(null)}`
 *   - Lines 73-75: `handleAddComment` function body
 *
 * These tests navigate to the detail view, submit a comment, and close the view.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックすると TicketDetail ビューが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // ticket list is hidden while detail is open
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('TicketDetail の Close ボタンで一覧ビューに戻る', () => {
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

  it('TicketDetail でコメントを追加するとコメントが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Tester' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'A test comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Tester');
    } finally {
      unmount();
    }
  });

  it('異なるチケットを連続して選択しても Detail が正しく切り替わる', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);

      // Select first ticket
      let cards = q.getAllByTestId('ticket-card');
      const firstTitle = within(cards[0]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('detail-title').textContent).toBe(firstTitle);

      // Go back and select second ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      cards = q.getAllByTestId('ticket-card');
      const secondTitle = within(cards[1]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[1]).getByTestId('ticket-title'));
      expect(q.getByTestId('detail-title').textContent).toBe(secondTitle);
    } finally {
      unmount();
    }
  });
});
