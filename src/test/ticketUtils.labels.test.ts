import { describe, it, expect } from 'vitest';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  it.each([
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ] as [Priority, string][])(
    'priority=%s → "%s"',
    (priority, expected) => {
      expect(getPriorityLabel(priority)).toBe(expected);
    }
  );
});

describe('getStatusLabel', () => {
  it.each([
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ] as [Status, string][])(
    'status=%s → "%s"',
    (status, expected) => {
      expect(getStatusLabel(status)).toBe(expected);
    }
  );
});
