ALTER TABLE sliders ADD COLUMN publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE sliders ADD COLUMN end_date TIMESTAMPTZ;
DROP INDEX IF EXISTS idx_sliders_active_order;
CREATE INDEX idx_sliders_active_publish ON sliders(is_active, publish_date);
