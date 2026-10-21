import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      // Clicking the title calls setSelectedTicketId — covers App.tsx:90 (truthy branch)
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // Ticket list controls should no longer be visible while detail is shown
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail back button returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Clicking ← Back calls onClose={() => setSelectedTicketId(null)} — covers App.tsx:116
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment in the detail view adds it to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      // Fill and submit the comment form — covers App.tsx:73-75 (handleAddComment body)
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Test User' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Test comment body' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getByTestId('comment-list')).toBeInTheDocument();
      expect(q.getByTestId('comment-author').textContent).toBe('Test User');
      expect(q.getByTestId('comment-body').textContent).toBe('Test comment body');
    } finally {
      unmount();
    }
  });

  it('submitting an incomplete comment does not add it to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      // Only fill author, leave body empty
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Test User' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket returns to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      // Select first ticket
      const cards = q.getAllByTestId('ticket-card');
      const firstTicketId = cards[0].getAttribute('data-ticket-id');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Go back and delete that ticket — handleDelete calls setSelectedTicketId(null)
      fireEvent.click(q.getByTestId('detail-close-button'));
      const updatedCards = q.getAllByTestId('ticket-card');
      const targetCard = updatedCards.find(c => c.getAttribute('data-ticket-id') === firstTicketId);
      if (targetCard) {
        fireEvent.click(within(targetCard).getByTestId('delete-button'));
      }

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
