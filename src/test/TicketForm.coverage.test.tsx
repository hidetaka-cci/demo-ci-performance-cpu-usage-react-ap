/**
 * Coverage gap test for TicketForm.tsx
 *
 * The PBT suite never types into the assignee input, so the assignee
 * onChange handler at TicketForm.tsx line 113
 * (`onChange={e => setAssignee(e.target.value)}`) is never invoked, and
 * the `assignee?.trim() || undefined` branch on line 33 is never observed
 * with a non-empty assignee. This test exercises both paths and asserts
 * the submitted payload contains the trimmed assignee.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field coverage', () => {
  it('types into the assignee field and submits the trimmed value', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={onCancel} />
    );
    const q = within(container);

    // Provide the minimum valid title/description so validation passes.
    fireEvent.change(q.getByTestId('title-input'), {
      target: { value: 'Title here' },
    });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Description body' },
    });

    // The interesting bit — exercises the assignee onChange handler (line 113).
    // Surrounding whitespace verifies the trim() branch on line 33.
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: '  Charlie  ' },
    });

    // Submit the form.
    fireEvent.submit(q.getByTestId('ticket-form'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: 'Title here',
      description: 'Description body',
      assignee: 'Charlie',
    });
  });

  it('treats an all-whitespace assignee as undefined in the submitted payload', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), {
      target: { value: 'Title here' },
    });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Description body' },
    });
    // Whitespace-only assignee — trim() yields '', so the `|| undefined` branch is taken.
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: '   ' },
    });

    fireEvent.submit(q.getByTestId('ticket-form'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.assignee).toBeUndefined();
  });
});
