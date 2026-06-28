/**
 * Unit tests for getPriorityLabel and getStatusLabel.
 *
 * These pure label helpers are only exercised indirectly through React
 * components in the existing PBT suite, leaving them uncovered when utility
 * tests run in isolation. This file pins down the human-readable mapping so
 * regressions surface without needing the full component render.
 */

import { describe, it, expect } from 'vitest';
import type { Priority, Status } from '../types/ticket';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';

describe('getPriorityLabel', () => {
  it.each<[Priority, string]>([
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ])('maps %s to %s', (priority, label) => {
    expect(getPriorityLabel(priority)).toBe(label);
  });

  it('returns a non-empty capitalized string for every supported priority', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    for (const p of priorities) {
      const label = getPriorityLabel(p);
      expect(label.length).toBeGreaterThan(0);
      expect(label[0]).toBe(label[0].toUpperCase());
    }
  });
});

describe('getStatusLabel', () => {
  it.each<[Status, string]>([
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ])('maps %s to %s', (status, label) => {
    expect(getStatusLabel(status)).toBe(label);
  });

  it('translates snake_case status into spaced Title Case', () => {
    expect(getStatusLabel('in_progress')).not.toContain('_');
    expect(getStatusLabel('in_progress').split(' ')).toHaveLength(2);
  });
});
