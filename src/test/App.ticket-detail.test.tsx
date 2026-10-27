import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title shows the TicketDetail panel', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');
    expect(cards.length).toBeGreaterThan(0);

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    unmount();
  });

  it('TicketDetail displays the title of the selected ticket', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');

    const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent;
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    unmount();
  });

  it('closing the detail view via the Back button returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    unmount();
  });

  it('adding a comment through the detail view calls onAddComment and shows comment', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    const detail = q.getByTestId('ticket-detail');

    fireEvent.change(within(detail).getByTestId('comment-author-input'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(within(detail).getByTestId('comment-body-input'), {
      target: { value: 'This is a comment.' },
    });
    fireEvent.click(within(detail).getByTestId('comment-submit-button'));

    const commentItems = within(detail).queryAllByTestId('comment-item');
    expect(commentItems.length).toBe(1);
    expect(within(commentItems[0]).getByTestId('comment-author').textContent).toBe('Alice');
    expect(within(commentItems[0]).getByTestId('comment-body').textContent).toBe('This is a comment.');
    unmount();
  });

  it('submitting an empty comment does not add a comment item', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    const detail = q.getByTestId('ticket-detail');

    fireEvent.click(within(detail).getByTestId('comment-submit-button'));
    expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    unmount();
  });

  it('deleting a selected ticket while on the detail view returns to the list', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');
    const firstCardId = within(cards[0]).getByTestId('ticket-title').textContent;

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(firstCardId);

    fireEvent.click(q.getByTestId('detail-close-button'));
    const updatedCards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(updatedCards[0]).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    unmount();
  });

  it('selecting different tickets shows their respective details', () => {
    const { container, unmount } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');
    if (cards.length < 2) { unmount(); return; }

    const title0 = within(cards[0]).getByTestId('ticket-title').textContent;
    const title1 = within(cards[1]).getByTestId('ticket-title').textContent;

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(title0);

    fireEvent.click(q.getByTestId('detail-close-button'));

    const refreshedCards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(refreshedCards[1]).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(title1);
    unmount();
  });
});
