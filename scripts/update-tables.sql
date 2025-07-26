-- Add new columns to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS triage_summary TEXT,
ADD COLUMN IF NOT EXISTS urgency VARCHAR(10) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high'));

-- Add message_type to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'doctor_intro', 'ai_triage'));

-- Update existing messages to have user type
UPDATE messages SET message_type = 'user' WHERE message_type IS NULL;
