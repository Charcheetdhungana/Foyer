-- ============================================================
-- Foyer — database schema
-- The same four tables db.js keeps in the browser today.
-- Written for PostgreSQL; works in SQLite with minor type changes.
-- ============================================================

-- One table for both account types. "role" decides which portal
-- the person sees after logging in.
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    role            VARCHAR(10)  NOT NULL CHECK (role IN ('business', 'personal')),
    email           VARCHAR(254) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,          -- bcrypt / argon2, never the plain password
    phone           VARCHAR(20),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Extra details for business accounts.
CREATE TABLE business_profiles (
    user_id         INTEGER      PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name   VARCHAR(120) NOT NULL
);

-- Extra details for personal accounts.
CREATE TABLE personal_profiles (
    user_id         INTEGER      PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name      VARCHAR(60)  NOT NULL,
    last_name       VARCHAR(60)  NOT NULL
);

-- Events are created by business accounts only.
CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    owner_id        INTEGER       NOT NULL REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    title           VARCHAR(120)  NOT NULL,
    description     TEXT          NOT NULL,
    event_date      DATE          NOT NULL,
    start_time      TIME          NOT NULL,
    venue           VARCHAR(120)  NOT NULL,
    room            VARCHAR(160)  NOT NULL,          -- shown on the ticket: which room to go to
    capacity        INTEGER       NOT NULL CHECK (capacity > 0),
    price           NUMERIC(8,2)  NOT NULL DEFAULT 0 CHECK (price >= 0),
    catering        BOOLEAN       NOT NULL DEFAULT FALSE,
    catering_price  NUMERIC(8,2)  NOT NULL DEFAULT 0 CHECK (catering_price >= 0),
    recording_url   VARCHAR(500),
    status          VARCHAR(10)   NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- One row per ticket. Name and email are copied in at registration so
-- the attendee list stays correct even if the account changes later.
CREATE TABLE registrations (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         INTEGER      REFERENCES personal_profiles(user_id) ON DELETE SET NULL,
    ticket_code     VARCHAR(12)  NOT NULL UNIQUE,    -- e.g. FY-7KQ2MX, encoded in the QR code
    attendee_name   VARCHAR(120) NOT NULL,
    attendee_email  VARCHAR(254) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_in_at   TIMESTAMP,                       -- NULL until scanned at the door
    UNIQUE (event_id, user_id)                       -- one ticket per person per event
);

CREATE INDEX idx_events_owner      ON events (owner_id);
CREATE INDEX idx_events_public     ON events (status, event_date);
CREATE INDEX idx_registrations_evt ON registrations (event_id);
