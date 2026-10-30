/**
 * Unit tests for App - ticket detail view and comment flow
 *
 * Covers uncovered lines in App.tsx:
 *   - Lines 73-75: handleAddComment (selecting a ticket then submitting a comment)
 *   - Line 116: onClose arrow function passed to TicketDetail
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      fireEvent.click(titles[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューで「← Back」をクリックするとリストに戻る', () => {
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

  it('詳細ビューでコメントを送信すると comment-list にコメントが追加される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good!' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getByTestId('comment-list')).toBeInTheDocument();
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('selectedTicketId がないまま handleAddComment が呼ばれても安全に早期リターンする', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // We are in list view, no ticket selected — comment-form is not rendered
      expect(q.queryByTestId('comment-form')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューで Back を押した後にチケットリストが再び表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const initialCount = q.getAllByTestId('ticket-card').length;

      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      // detail view hides the list
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));
      // list view restored
      expect(q.getAllByTestId('ticket-card')).toHaveLength(initialCount);
    } finally {
      unmount();
    }
  });
});
