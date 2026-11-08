import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title shows the TicketDetail panel', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
  });

  it('TicketDetail shows the title of the selected ticket', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    const titleText = within(cards[0]).getByTestId('ticket-title').textContent ?? '';
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.getByTestId('detail-title').textContent).toBe(titleText);
  });

  it('list view is hidden while TicketDetail is open', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
  });

  it('clicking the Back button closes TicketDetail and restores the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('adding a comment through TicketDetail increments the comment count', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.getAllByTestId('comment-item')).toHaveLength(1);
  });

  it('comment author and body are displayed after submission', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Bob' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Found the root cause.' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    const item = q.getByTestId('comment-item');
    expect(within(item).getByTestId('comment-author').textContent).toBe('Bob');
    expect(within(item).getByTestId('comment-body').textContent).toBe('Found the root cause.');
  });

  it('deleting the selected ticket closes TicketDetail and restores the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    const firstCardId = cards[0].getAttribute('data-ticket-id');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Go back and delete the same ticket
    fireEvent.click(q.getByTestId('detail-close-button'));
    const refreshedCards = q.getAllByTestId('ticket-card');
    const targetCard = refreshedCards.find(c => c.getAttribute('data-ticket-id') === firstCardId)!;
    fireEvent.click(within(targetCard).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });
});
