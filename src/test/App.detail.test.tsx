import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title shows the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    expect(cards.length).toBeGreaterThan(0);

    const firstTitle = within(cards[0]).getByTestId('ticket-title');
    fireEvent.click(firstTitle);

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('the detail view shows the correct ticket title', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    const firstTitle = within(cards[0]).getByTestId('ticket-title');
    const titleText = firstTitle.textContent;
    fireEvent.click(firstTitle);

    expect(q.getByTestId('detail-title').textContent).toBe(titleText);
  });

  it('clicking the back button from detail view returns to the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
    fireEvent.click(firstTitle);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('adding a comment through the detail view calls createComment and updates comments', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
    fireEvent.click(firstTitle);

    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'This is a comment.' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items.length).toBe(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('This is a comment.');
  });

  it('selecting a deleted ticket clears the selection', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    const firstTitle = within(cards[0]).getByTestId('ticket-title');
    fireEvent.click(firstTitle);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });
});
