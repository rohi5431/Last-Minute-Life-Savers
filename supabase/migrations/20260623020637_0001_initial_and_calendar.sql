-- Last-Minute Life Saver: initial schema + calendar integration (Phases 1-6 combined)

-- users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);

-- goals
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_goals_id ON goals(id);
CREATE INDEX IF NOT EXISTS ix_goals_user_id ON goals(user_id);

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_min INTEGER,
    priority TEXT NOT NULL DEFAULT 'medium',
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    ai_metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_tasks_id ON tasks(id);
CREATE INDEX IF NOT EXISTS ix_tasks_goal_id ON tasks(goal_id);

-- schedules
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_schedules_id ON schedules(id);
CREATE INDEX IF NOT EXISTS ix_schedules_user_id ON schedules(user_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_notifications_id ON notifications(id);
CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications(user_id);

-- calendar_tokens (Phase 5)
CREATE TABLE IF NOT EXISTS calendar_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google',
    access_token TEXT,
    refresh_token TEXT,
    token_uri TEXT,
    client_id TEXT,
    client_secret TEXT,
    scopes TEXT,
    connected BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_calendar_tokens_id ON calendar_tokens(id);
CREATE INDEX IF NOT EXISTS ix_calendar_tokens_user_id ON calendar_tokens(user_id);

-- calendar_events (Phase 5)
CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'google',
    title TEXT NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    location TEXT,
    imported_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_calendar_events_id ON calendar_events(id);
CREATE INDEX IF NOT EXISTS ix_calendar_events_user_id ON calendar_events(user_id);
ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS uq_calendar_events_user_external_provider;
ALTER TABLE calendar_events
  ADD CONSTRAINT uq_calendar_events_user_external_provider
  UNIQUE (user_id, external_id, provider);
