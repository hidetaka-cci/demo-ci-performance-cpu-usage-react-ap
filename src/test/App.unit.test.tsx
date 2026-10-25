import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function renderApp() {
  const result = render(<App />);
  return { ...result, q: within(result.container) };
}

describe('App - ticket detail navigation', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { q, unmount } = renderApp();
    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    unmount();
  });

  it('detail view shows the correct ticket title', () => {
    const { q, unmount } = renderApp();
    const firstCard = q.getAllByTestId('ticket-card')[0];
    const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;

    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(cardTitle);
    unmount();
  });

  it('closing the detail view returns to the ticket list', () => {
    const { q, unmount } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    unmount();
  });
});

describe('App - adding comments (handleAddComment)', () => {
  it('submitting a comment adds it to the detail view', () => {
    const { q, unmount } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me!' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.getAllByTestId('comment-item')).toHaveLength(1);
    expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me!');
    unmount();
  });

  it('multiple comments all appear in the detail view', () => {
    const { q, unmount } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    for (let i = 1; i <= 3; i++) {
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: `User${i}` } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: `Comment ${i}` } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
    }

    expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    unmount();
  });

  it('comment with empty author is not submitted', () => {
    const { q, unmount } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'No author comment' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    unmount();
  });

  it('comments belong to the selected ticket and do not bleed to others', () => {
    const { q, unmount } = renderApp();
    const cards = q.getAllByTestId('ticket-card');

    // Add a comment to the first ticket
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Tester' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'First ticket comment' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));
    fireEvent.click(q.getByTestId('detail-close-button'));

    // Navigate to the second ticket — should have no comments
    const updatedCards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(updatedCards[1]).getByTestId('ticket-title'));
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    unmount();
  });
});

describe('App - selectedTicket state', () => {
  it('deleting the selected ticket closes the detail view', () => {
    const { q, unmount } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Go back to list and delete the first ticket
    fireEvent.click(q.getByTestId('detail-close-button'));
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    unmount();
  });
});
