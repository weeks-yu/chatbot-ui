ALTER TABLE profiles ADD COLUMN moonshot_api_key TEXT CHECK (char_length(moon_api_key) <= 1000);
