import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking ticket title opens detail view and hides list', () => {
    const { container } = render(<App />);
    const q = within(container);
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('detail view shows the selected ticket title and description', () => {
    const { container } = render(<App />);
    const q = within(container);
    const cards = q.getAllByTestId('ticket-card');
    const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent;
    const expectedDesc = within(cards[0]).getByTestId('ticket-description').textContent;
    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    expect(q.getByTestId('detail-description').textContent).toBe(expectedDesc);
  });

  it('close button in detail view returns to ticket list (covers App line 116)', () => {
    const { container } = render(<App />);
    const q = within(container);
    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    fireEvent.click(q.getByTestId('detail-close-button'));
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('submitting a comment in detail view adds it to the list (covers App lines 73-75)', () => {
    const { container } = render(<App />);
    const q = within(container);
    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'Looking into this now.' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));
    expect(q.getAllByTestId('comment-item')).toHaveLength(1);
    expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    expect(q.getByTestId('comment-body').textContent).toBe('Looking into this now.');
  });

  it('submitting comment with empty author does not add a comment', () => {
    const { container } = render(<App />);
    const q = within(container);
    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'Some body' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('comments are scoped to the ticket they were added to', () => {
    const { container } = render(<App />);
    const q = within(container);

    // Add comment to first ticket
    fireEvent.click(q.getAllByTestId('ticket-title')[0]);
    const firstTitle = q.getByTestId('detail-title').textContent;
    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), { target: { value: 'Bob' } });
    fireEvent.change(within(form).getByTestId('comment-body-input'), { target: { value: 'First ticket comment' } });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));
    expect(q.getAllByTestId('comment-item')).toHaveLength(1);

    // Close and open second ticket — should have no comments
    fireEvent.click(q.getByTestId('detail-close-button'));
    const cards = q.getAllByTestId('ticket-card');
    const secondTitle = within(cards[1]).getByTestId('ticket-title').textContent;
    expect(secondTitle).not.toBe(firstTitle);
    fireEvent.click(within(cards[1]).getByTestId('ticket-title'));
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });
});
