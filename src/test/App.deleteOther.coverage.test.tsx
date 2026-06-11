/**
 * Deterministic coverage test for the App.handleDelete false branch
 * (App.tsx line 69: `if (selectedTicketId === id) setSelectedTicketId(null)`).
 *
 * Existing coverage tests delete the *currently selected* ticket, exercising
 * the true branch. This file exercises the false branch by selecting one
 * ticket, returning to the list, and deleting a *different* ticket — the
 * selection state should be preserved (and reopening the detail still works).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - delete a non-selected ticket', () => {
  it('leaves the existing selection intact when a different ticket is deleted', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cardsBefore = q.getAllByTestId('ticket-card');
      expect(cardsBefore.length).toBeGreaterThanOrEqual(2);

      const selectedCard = cardsBefore[0];
      const selectedId = selectedCard.getAttribute('data-ticket-id');
      const otherCard = cardsBefore[1];
      const otherId = otherCard.getAttribute('data-ticket-id');
      expect(selectedId).not.toBe(otherId);

      // Open detail for the first ticket, then close back to the list view.
      fireEvent.click(within(selectedCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Delete the *other* ticket — the false branch of `selectedTicketId === id`.
      const otherStill = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === otherId);
      expect(otherStill).toBeDefined();
      fireEvent.click(within(otherStill!).getByTestId('delete-button'));

      // The other ticket is gone, the previously selected ticket is still in the list.
      const remainingIds = q
        .getAllByTestId('ticket-card')
        .map(c => c.getAttribute('data-ticket-id'));
      expect(remainingIds).not.toContain(otherId);
      expect(remainingIds).toContain(selectedId);

      // Re-opening the original selection still works — selectedTicketId was preserved.
      const stillSelectable = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === selectedId)!;
      fireEvent.click(within(stillSelectable).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('deleting a non-selected ticket while no ticket is selected still removes it', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cardsBefore = q.getAllByTestId('ticket-card');
      const targetId = cardsBefore[cardsBefore.length - 1].getAttribute('data-ticket-id');

      fireEvent.click(within(cardsBefore[cardsBefore.length - 1]).getByTestId('delete-button'));

      const remainingIds = q
        .getAllByTestId('ticket-card')
        .map(c => c.getAttribute('data-ticket-id'));
      expect(remainingIds).not.toContain(targetId);
      expect(remainingIds).toHaveLength(cardsBefore.length - 1);
    } finally {
      unmount();
    }
  });
});
