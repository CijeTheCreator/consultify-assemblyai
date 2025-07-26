-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'patient')),
  specialization VARCHAR(255), -- Only for doctors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_reads table for read receipts
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Create typing_indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consultation_id, user_id)
);

-- Insert sample data
INSERT INTO users (email, name, role, specialization) VALUES
  ('dr.smith@hospital.com', 'Dr. Sarah Smith', 'doctor', 'Cardiology'),
  ('dr.johnson@clinic.com', 'Dr. Michael Johnson', 'doctor', 'General Medicine'),
  ('patient1@email.com', 'John Doe', 'patient', NULL),
  ('patient2@email.com', 'Jane Wilson', 'patient', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert sample consultations
INSERT INTO consultations (patient_id, doctor_id, title, status) 
SELECT 
  p.id as patient_id,
  d.id as doctor_id,
  'General Health Checkup',
  'active'
FROM users p, users d 
WHERE p.role = 'patient' AND d.role = 'doctor' AND p.email = 'patient1@email.com' AND d.email = 'dr.smith@hospital.com'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (patient_id, doctor_id, title, status) 
SELECT 
  p.id as patient_id,
  d.id as doctor_id,
  'Follow-up Consultation',
  'completed'
FROM users p, users d 
WHERE p.role = 'patient' AND d.role = 'doctor' AND p.email = 'patient2@email.com' AND d.email = 'dr.johnson@clinic.com'
ON CONFLICT DO NOTHING;
