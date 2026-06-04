import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the detail view', () => {
    render(<App />);
    const titles = screen.getAllByTestId('ticket-title');
    fireEvent.click(titles[0]);
    expect(screen.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
  });

  it('clicking the close button returns to the list view', () => {
    render(<App />);
    const titles = screen.getAllByTestId('ticket-title');
    fireEvent.click(titles[0]);
    fireEvent.click(screen.getByTestId('detail-close-button'));
    expect(screen.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('adding a comment from the detail view displays the comment', () => {
    render(<App />);
    // Tickets sorted newest first; TICKET-0003 has no assignee, avoids text conflicts
    const titles = screen.getAllByTestId('ticket-title');
    fireEvent.click(titles[0]);

    fireEvent.change(screen.getByTestId('comment-author-input'), {
      target: { value: 'Reviewer' },
    });
    fireEvent.change(screen.getByTestId('comment-body-input'), {
      target: { value: 'Looks good to me' },
    });
    fireEvent.click(screen.getByTestId('comment-submit-button'));

    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    expect(screen.getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(screen.getByTestId('comment-body').textContent).toBe('Looks good to me');
  });

  it('comment form is cleared after a successful submission', () => {
    render(<App />);
    const titles = screen.getAllByTestId('ticket-title');
    fireEvent.click(titles[0]);

    const authorInput = screen.getByTestId('comment-author-input') as HTMLInputElement;
    const bodyInput = screen.getByTestId('comment-body-input') as HTMLTextAreaElement;

    fireEvent.change(authorInput, { target: { value: 'Tester' } });
    fireEvent.change(bodyInput, { target: { value: 'A test comment' } });
    fireEvent.click(screen.getByTestId('comment-submit-button'));

    expect(authorInput.value).toBe('');
    expect(bodyInput.value).toBe('');
  });
});
