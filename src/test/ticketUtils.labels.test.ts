/**
 * Unit tests for getPriorityLabel / getStatusLabel.
 *
 * These two helpers from ticketUtils are exercised only indirectly via
 * component renders, where assertions look at `.textContent.toBeTruthy()`
 * rather than the exact mapped label. This file pins down the label
 * mapping itself so a change to one of the string values is caught by
 * a focused unit failure.
 */

import { describe, it, expect } from 'vitest';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  it('maps "low" to "Low"', () => {
    expect(getPriorityLabel('low')).toBe('Low');
  });

  it('maps "medium" to "Medium"', () => {
    expect(getPriorityLabel('medium')).toBe('Medium');
  });

  it('maps "high" to "High"', () => {
    expect(getPriorityLabel('high')).toBe('High');
  });

  it('maps "critical" to "Critical"', () => {
    expect(getPriorityLabel('critical')).toBe('Critical');
  });

  it('returns a non-empty string for every Priority value', () => {
    const all: Priority[] = ['low', 'medium', 'high', 'critical'];
    for (const p of all) {
      const label = getPriorityLabel(p);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('getStatusLabel', () => {
  it('maps "open" to "Open"', () => {
    expect(getStatusLabel('open')).toBe('Open');
  });

  it('maps "in_progress" to "In Progress" (with a space)', () => {
    expect(getStatusLabel('in_progress')).toBe('In Progress');
  });

  it('maps "resolved" to "Resolved"', () => {
    expect(getStatusLabel('resolved')).toBe('Resolved');
  });

  it('maps "closed" to "Closed"', () => {
    expect(getStatusLabel('closed')).toBe('Closed');
  });

  it('returns a non-empty string for every Status value', () => {
    const all: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    for (const s of all) {
      const label = getStatusLabel(s);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('produces distinct labels for distinct status values', () => {
    const all: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    const labels = all.map(getStatusLabel);
    expect(new Set(labels).size).toBe(all.length);
  });
});
