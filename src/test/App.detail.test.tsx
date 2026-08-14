/**
 * Coverage tests for App.tsx ticket-detail flow.
 *
 * Existing property-based tests never enter the detail view, so the code paths
 * for selecting a ticket, adding a comment, and closing the detail (App.tsx
 * lines 73-75, 90, 116) were uncovered. These deterministic unit tests exercise
 * that flow directly.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function openFirstTicketDetail(container: HTMLElement) {
  const q = within(container);
  const titles = q.getAllByTestId('ticket-title');
  fireEvent.click(titles[0]);
}

describe('App - ticket detail interactions', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      const expectedTitle = firstTitle.textContent;

      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      const detailTitle = q.getByTestId('detail-title');
      expect(detailTitle.textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('detail view hides the ticket list and controls', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('filter-panel')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('close button returns to the ticket list view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      const closeBtn = q.getByTestId('detail-close-button');
      fireEvent.click(closeBtn);

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment via the detail view appends it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      const authorInput = q.getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = q.getByTestId('comment-body-input') as HTMLTextAreaElement;
      const submit = q.getByTestId('comment-submit-button');

      fireEvent.change(authorInput, { target: { value: 'Alice' } });
      fireEvent.change(bodyInput, { target: { value: 'This looks good.' } });
      fireEvent.click(submit);

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
      expect(q.getByTestId('comment-body').textContent).toBe('This looks good.');
    } finally {
      unmount();
    }
  });

  it('empty or whitespace-only comment submissions are ignored', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      const submit = q.getByTestId('comment-submit-button');
      fireEvent.click(submit);
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      const authorInput = q.getByTestId('comment-author-input');
      const bodyInput = q.getByTestId('comment-body-input');
      fireEvent.change(authorInput, { target: { value: '   ' } });
      fireEvent.change(bodyInput, { target: { value: '   ' } });
      fireEvent.click(submit);

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('comment count in the detail header updates after adding a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      openFirstTicketDetail(container);

      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByText(/Comments \(0\)/)).toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Bob' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Reviewed.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(within(detail).getByText(/Comments \(1\)/)).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
