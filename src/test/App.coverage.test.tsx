/**
 * Coverage tests for the App component
 *
 * Targets previously uncovered interactions:
 *  - Selecting a ticket via its title (opens TicketDetail)
 *  - Adding a comment through TicketDetail (App.handleAddComment)
 *  - Closing the detail view via the "← Back" button
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('opens the detail view when a ticket title is clicked and closes it via the Back button', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(q.getByTestId('detail-title').textContent).toBe(firstTitle.textContent);

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adds a comment to the selected ticket and displays it', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Carol' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Carol');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('scopes comments per ticket: switching tickets shows only that ticket\'s comments', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      const firstTitleText = titles[0].textContent ?? '';
      const secondTitleText = titles[1].textContent ?? '';
      expect(firstTitleText).not.toBe(secondTitleText);

      fireEvent.click(titles[0]);
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Dana' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'On ticket one.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);

      fireEvent.click(q.getByTestId('detail-close-button'));

      const secondTitle = q.getAllByTestId('ticket-title').find(el => el.textContent === secondTitleText);
      expect(secondTitle).toBeDefined();
      fireEvent.click(secondTitle!);
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('ignores blank comment submissions (empty author or body)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      // Body only, author empty
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'no author' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // Author only, body empty
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: '' } });
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Eve' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('clears the selection when the currently-viewed ticket is deleted from the list', () => {
    // Open a ticket, close the detail, then delete the same ticket from the list.
    // This exercises the `selectedTicketId === id → setSelectedTicketId(null)` branch
    // in App.handleDelete.
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitleText = q.getAllByTestId('ticket-title')[0].textContent;

      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      const cards = q.getAllByTestId('ticket-card');
      const targetCard = cards.find(
        c => within(c).getByTestId('ticket-title').textContent === firstTitleText
      );
      expect(targetCard).toBeDefined();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      const remainingTitles = q.getAllByTestId('ticket-title').map(el => el.textContent);
      expect(remainingTitles).not.toContain(firstTitleText);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
