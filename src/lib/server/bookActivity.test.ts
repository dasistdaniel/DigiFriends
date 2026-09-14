import { describe, expect, it } from 'vitest';
import { computeBookActivity } from './bookActivity';

const DAY = 24 * 60 * 60 * 1000;

describe('computeBookActivity', () => {
	it('uses the book update time when there are no entries', () => {
		const now = Date.now();
		const bookUpdatedAt = new Date(now - 10 * DAY);
		const { lastActivityAt, inactive } = computeBookActivity(bookUpdatedAt, [], 5, now);

		expect(lastActivityAt).toEqual(bookUpdatedAt);
		expect(inactive).toBe(true);
	});

	it('uses the most recent entry update when it is later than the book itself', () => {
		const now = Date.now();
		const bookUpdatedAt = new Date(now - 400 * DAY);
		const recentEntry = new Date(now - 2 * DAY);
		const olderEntry = new Date(now - 300 * DAY);
		const { lastActivityAt, inactive } = computeBookActivity(
			bookUpdatedAt,
			[olderEntry, recentEntry],
			365,
			now
		);

		expect(lastActivityAt).toEqual(recentEntry);
		expect(inactive).toBe(false);
	});

	it('is not inactive right below the threshold, and is at/above it', () => {
		const now = Date.now();
		const justUnder = new Date(now - 364 * DAY);
		const atThreshold = new Date(now - 365 * DAY);

		expect(computeBookActivity(justUnder, [], 365, now).inactive).toBe(false);
		expect(computeBookActivity(atThreshold, [], 365, now).inactive).toBe(true);
	});
});
