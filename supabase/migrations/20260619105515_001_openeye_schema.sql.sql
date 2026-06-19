-- User customizations (themes, wallpapers, icons, etc. installed from store)
CREATE TABLE user_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('theme', 'wallpaper', 'design', 'font', 'widget', 'icon', 'sound', 'effect')),
  item_id text NOT NULL,
  item_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Saved scans from OCR
CREATE TABLE saved_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scans ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_customizations
CREATE POLICY "select_own_customizations" ON user_customizations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_customizations" ON user_customizations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_customizations" ON user_customizations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_customizations" ON user_customizations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for saved_scans
CREATE POLICY "select_own_scans" ON saved_scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_scans" ON saved_scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_scans" ON saved_scans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_scans" ON saved_scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_customizations_user ON user_customizations(user_id);
CREATE INDEX idx_saved_scans_user ON saved_scans(user_id);