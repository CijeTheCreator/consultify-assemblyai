-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medications JSONB NOT NULL, -- Array of {drug_name, amount, frequency}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add prescription message type
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN ('user', 'system', 'doctor_intro', 'ai_triage', 'prescription'));

-- Add prescription_id to messages table for linking
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE;
