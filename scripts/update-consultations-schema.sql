-- Allow consultations without doctors initially (for AI triage)
ALTER TABLE consultations 
ALTER COLUMN doctor_id DROP NOT NULL;

-- Add consultation_type to track different types
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS consultation_type VARCHAR(20) DEFAULT 'human' CHECK (consultation_type IN ('ai_triage', 'human', 'completed'));

-- Add AI triage status
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS ai_triage_status VARCHAR(20) DEFAULT 'in_progress' CHECK (ai_triage_status IN ('in_progress', 'completed', 'transferred'));

-- Update existing consultations
UPDATE consultations SET consultation_type = 'human' WHERE doctor_id IS NOT NULL;
UPDATE consultations SET consultation_type = 'ai_triage' WHERE doctor_id IS NULL;
