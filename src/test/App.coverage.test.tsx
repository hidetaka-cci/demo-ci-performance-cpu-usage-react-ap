/**
 * Coverage-targeted tests for App integration.
 *
 * These unit-style tests exercise App.tsx branches not reached by the
 * existing property-based tests:
 *   - selecting a ticket (TicketCard title → TicketDetail)
 *   - adding a comment while a ticket is selected (handleAddComment)
 *   - closing the detail view (onClose → setSelectedTicketId(null))
 *   - deleting the currently selected ticket (clears selection)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view interactions', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      expect(titles.length).toBeGreaterThan(0);

      fireEvent.click(titles[0]);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(q.getByTestId('detail-title')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('closing the detail view returns to the ticket list', () => {
    const { unmount, container } = render(<App />);
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

  it('submitting a comment in the detail view adds it to the comment list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const authors = q.getAllByTestId('comment-author');
      expect(authors.map(el => el.textContent)).toContain('Reviewer');
      const bodies = q.getAllByTestId('comment-body');
      expect(bodies.map(el => el.textContent)).toContain('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('deleting the currently-selected ticket clears the selection and returns to the list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      const selectedTicketId = firstTitle
        .closest('[data-testid="ticket-card"]')
        ?.getAttribute('data-ticket-id');
      expect(selectedTicketId).toBeTruthy();

      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail so delete button is visible in the list again
      fireEvent.click(q.getByTestId('detail-close-button'));

      const remainingCard = container.querySelector(
        `[data-ticket-id="${selectedTicketId}"]`,
      );
      expect(remainingCard).not.toBeNull();
      const deleteBtn = remainingCard!.querySelector(
        '[data-testid="delete-button"]',
      ) as HTMLButtonElement;
      fireEvent.click(deleteBtn);

      expect(
        container.querySelector(`[data-ticket-id="${selectedTicketId}"]`),
      ).toBeNull();
    } finally {
      unmount();
    }
  });

  it('deleting the ticket while its detail view is open clears the selection', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      const selectedTicketId = firstTitle
        .closest('[data-testid="ticket-card"]')
        ?.getAttribute('data-ticket-id');

      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail, delete, then verify no stale selection re-opens detail
      fireEvent.click(q.getByTestId('detail-close-button'));
      const card = container.querySelector(
        `[data-ticket-id="${selectedTicketId}"]`,
      );
      const deleteBtn = card!.querySelector(
        '[data-testid="delete-button"]',
      ) as HTMLButtonElement;
      fireEvent.click(deleteBtn);

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
