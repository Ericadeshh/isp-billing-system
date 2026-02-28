import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every minute to check for expired subscriptions
crons.interval(
  "expire subscriptions",
  { minutes: 1 }, // Every minute for testing
  internal.subscriptions.mutations.expireSubscriptionsInternal, // Note the Internal suffix
  {}, // No arguments needed
);

// Also run daily at midnight to clean up
crons.daily(
  "daily subscription cleanup",
  { hourUTC: 0, minuteUTC: 0 }, // Midnight UTC
  internal.subscriptions.mutations.expireSubscriptionsInternal,
  {},
);

export default crons;
