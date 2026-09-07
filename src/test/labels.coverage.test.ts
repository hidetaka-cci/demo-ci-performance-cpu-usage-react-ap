/**
 * Coverage tests for label helpers in ticketUtils.
 *
 * `getPriorityLabel` and `getStatusLabel` are used only from React components,
 * so the existing property-based tests for `ticketUtils.ts` do not exercise
 * them directly. This file adds focused, exhaustive tests for both helpers so
 * they are covered without depending on component-level tests.
 */

import { describe, it, expect } from 'vitest';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  const cases: Array<[Priority, string]> = [
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ];

  it.each(cases)('returns the human readable label for %s', (priority, expected) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });

  it('returns a non-empty label for every priority value', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    for (const p of priorities) {
      const label = getPriorityLabel(p);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('getStatusLabel', () => {
  const cases: Array<[Status, string]> = [
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ];

  it.each(cases)('returns the human readable label for %s', (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });

  it('returns a non-empty label for every status value', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    for (const s of statuses) {
      const label = getStatusLabel(s);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('formats in_progress with a space rather than an underscore', () => {
    // Guards against a regression where the raw enum value leaks into the UI.
    expect(getStatusLabel('in_progress')).not.toContain('_');
  });
});
