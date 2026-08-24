/**
 * Interaction tests for TicketForm component
 *
 * Complements TicketForm.pbt.test.tsx by covering the assignee input and
 * priority select onChange handlers, and validation edge cases (e.g. the
 * 200-character title limit and pure-whitespace input) that the existing
 * property-based tests do not exercise directly.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { Priority } from '../types/ticket';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const utils = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...utils, onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('reflects typed values in the assignee input', () => {
    const { container } = renderForm();
    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');

    fireEvent.change(input, { target: { value: 'Bob' } });
    expect(input.value).toBe('Bob');
  });

  it('submits the trimmed assignee value', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'Title' },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });
    fireEvent.change(within(container).getByTestId('assignee-input'), {
      target: { value: '  Carol  ' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Carol');
  });

  it('submits undefined assignee when the input is only whitespace', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'Title' },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });
    fireEvent.change(within(container).getByTestId('assignee-input'), {
      target: { value: '   ' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});

describe('TicketForm - priority select', () => {
  const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];

  priorities.forEach((priority) => {
    it(`submits with priority "${priority}" after selecting it`, () => {
      const { container, onSubmit } = renderForm();

      fireEvent.change(within(container).getByTestId('title-input'), {
        target: { value: 'Title' },
      });
      fireEvent.change(within(container).getByTestId('description-input'), {
        target: { value: 'Description' },
      });
      fireEvent.change(within(container).getByTestId('priority-select'), {
        target: { value: priority },
      });

      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].priority).toBe(priority);
    });
  });

  it('defaults to medium priority when not changed', () => {
    const { container } = renderForm();
    const select = within(container).getByTestId('priority-select') as HTMLSelectElement;
    expect(select.value).toBe('medium');
  });
});

describe('TicketForm - validation edge cases', () => {
  it('shows title error and does not submit when title is only whitespace', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: '     ' },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(within(container).getByTestId('title-error').textContent).toBe(
      'Title is required'
    );
  });

  it('shows the length error when title exceeds 200 characters', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'a'.repeat(201) },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(within(container).getByTestId('title-error').textContent).toBe(
      'Title must be 200 characters or less'
    );
  });

  it('accepts a title of exactly 200 characters', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'a'.repeat(200) },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].title).toHaveLength(200);
  });

  it('shows description error when description is only whitespace', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'Title' },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: '   ' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(within(container).getByTestId('description-error').textContent).toBe(
      'Description is required'
    );
  });
});

describe('TicketForm - tags handling', () => {
  it('splits comma-separated tags, trims each, and drops empties', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'Title' },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });
    fireEvent.change(within(container).getByTestId('tags-input'), {
      target: { value: '  bug , , frontend ,   , urgent' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'frontend', 'urgent']);
  });

  it('submits an empty tags array when the tags input is blank', () => {
    const { container, onSubmit } = renderForm();

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'Title' },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Description' },
    });

    fireEvent.click(within(container).getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].tags).toEqual([]);
  });
});
