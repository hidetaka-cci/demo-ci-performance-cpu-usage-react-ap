import { describe, it, expect } from 'vitest';
import { render, within, fireEvent, screen } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('opens detail view when ticket title is clicked', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();
  });

  it('hides ticket list and filter panel when detail view is open', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(within(container).queryByTestId('ticket-list')).not.toBeInTheDocument();
    expect(within(container).queryByTestId('filter-panel')).not.toBeInTheDocument();
  });

  it('shows the correct ticket title in detail view', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    const clickedTitle = within(cards[0]).getByTestId('ticket-title').textContent;
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(within(container).getByTestId('detail-title').textContent).toBe(clickedTitle);
  });

  it('closes detail view and restores list when Back button is clicked', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(within(container).getByTestId('detail-close-button'));
    expect(within(container).queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(within(container).getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('shows comment form in detail view', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(within(container).getByTestId('comment-form')).toBeInTheDocument();
  });

  it('starts with zero comment items in detail view', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(within(container).queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('adds a comment and shows it in the comment list', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    const form = within(container).getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'This is a comment' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    const items = within(container).getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('This is a comment');
  });

  it('clears comment form inputs after successful submission', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    const form = within(container).getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: 'Bob' },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'Comment body' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    expect((within(form).getByTestId('comment-author-input') as HTMLInputElement).value).toBe('');
    expect((within(form).getByTestId('comment-body-input') as HTMLTextAreaElement).value).toBe('');
  });

  it('does not add comment when author is empty', () => {
    const { container } = render(<App />);
    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

    const form = within(container).getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'Comment without author' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    expect(within(container).queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('closing detail view does not affect ticket count', () => {
    const { container } = render(<App />);
    const initialCount = within(container).getAllByTestId('ticket-card').length;

    const cards = within(container).getAllByTestId('ticket-card');
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    fireEvent.click(within(container).getByTestId('detail-close-button'));

    expect(within(container).getAllByTestId('ticket-card')).toHaveLength(initialCount);
  });

  it('deleting the selected ticket closes the detail view', () => {
    render(<App />);
    const cards = screen.getAllByTestId('ticket-card');
    const firstTitle = within(cards[0]).getByTestId('ticket-title').textContent;
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(screen.getByTestId('ticket-detail')).toBeInTheDocument();

    // Delete the viewed ticket via the delete button — need to go back to list first
    fireEvent.click(screen.getByTestId('detail-close-button'));
    const updatedCards = screen.getAllByTestId('ticket-card');
    const targetCard = updatedCards.find(
      c => within(c).getByTestId('ticket-title').textContent === firstTitle
    );
    if (targetCard) {
      fireEvent.click(within(targetCard).getByTestId('delete-button'));
    }
    expect(screen.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});
