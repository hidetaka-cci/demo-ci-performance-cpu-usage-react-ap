import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

// Covers the title-length validation branch (title.trim().length > 200) and
// assignee handling that are not reached by the existing PBT suite.

describe('TicketForm - title length validation', () => {
  it('shows "Title must be 200 characters or less" for a 201-char title', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(201) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toHaveTextContent(
        'Title must be 200 characters or less'
      );
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('accepts a title of exactly 200 characters without error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(200) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });

  it('shows "Title is required" for a whitespace-only title', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: '   ' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toHaveTextContent('Title is required');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - assignee field', () => {
  it('passes assignee value to onSubmit when filled', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 'Alice' })
      );
    } finally {
      unmount();
    }
  });

  it('passes assignee as undefined when the assignee field is left empty', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: undefined })
      );
    } finally {
      unmount();
    }
  });
});
