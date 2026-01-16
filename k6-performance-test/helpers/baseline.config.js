// helpers/baseline.config.js
// TRUE baseline configuration - single user, no load, establishing performance floor

/**
 * The Purpose of Baseline
 * Baseline tests measure and establish your performance floor. They answer: "What does my system do with 1 user and no load?"
 * You cannot set thresholds before you know what normal performance is. That's backwards.
 *
 * The Proper Flow:
 * Run baseline (1 VU, no thresholds) → Get metrics
 * Analyze results → "Oh, p95 is 200ms, p99 is 350ms"
 * Set thresholds for load tests → "p95 should stay under 500ms with 50 users"
 */

export const options = {
    // Single virtual user - this is NOT a load test
    vus: 1,
    iterations: 1

    // No thresholds in baseline - we're measuring, not asserting
    // Baseline establishes what "normal" is, not what's acceptable
}