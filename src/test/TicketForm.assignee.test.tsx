/**
 * Targeted tests for TicketForm assignee input.
 *
 * Existing PBT suite (TicketForm.pbt.test.tsx) never types into the assignee
 * field, leaving the `setAssignee` change handler (TicketForm.tsx:113) and the
 * `assignee?.trim() || undefined` branch in handleSubmit (line 33) uncovered.
 * These tests close that gap.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function setup() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee handling', () => {
  it('typing into the assignee input updates the value', () => {
    const { q, unmount } = setup();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('a trimmed assignee is forwarded to onSubmit', () => {
    const { q, unmount, onSubmit } = setup();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('an empty assignee is submitted as undefined', () => {
    const { q, unmount, onSubmit } = setup();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('a whitespace-only assignee is submitted as undefined', () => {
    const { q, unmount, onSubmit } = setup();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('a title longer than 200 characters surfaces a title error and blocks submit', () => {
    const { q, unmount, onSubmit } = setup();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toMatch(/200 characters or less/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('a title of exactly 200 characters is accepted', () => {
    const { q, unmount, onSubmit } = setup();
    try {
      const title = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(title);
    } finally {
      unmount();
    }
  });
});
