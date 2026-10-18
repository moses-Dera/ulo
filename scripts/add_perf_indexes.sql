-- Performance indexes: run this on production once.
-- All statements use IF NOT EXISTS so they are safe to re-run.
-- These are the ONLY new objects — existing tables/constraints are untouched.

-- 1. Partial index on bookings.expires_at WHERE status = 'PENDING'
--    The expiry cron (expireStalePendingBookings) now hits an index-seek
--    instead of a full-table scan. Expected gain: ms → sub-ms at scale.
CREATE INDEX IF NOT EXISTS idx_bookings_pending_expires
  ON bookings (expires_at)
  WHERE status = 'PENDING';

-- 2. Composite index on bookings (status, requested_at)
--    Landlord dashboard query sorts by requested_at; adding status first
--    makes the filter + sort an index-only scan.
CREATE INDEX IF NOT EXISTS idx_bookings_status_requested_at
  ON bookings (status, requested_at);

-- 3. Compound index on notifications (user_id, read_at)
--    Unread-count queries filter WHERE user_id = $1 AND read_at IS NULL.
--    This avoids a sequential scan of the whole notifications table per user.
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications (user_id, read_at);

-- ANALYZE so the planner picks up the new indexes immediately.
ANALYZE bookings;
ANALYZE notifications;
