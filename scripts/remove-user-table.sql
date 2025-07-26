-- Remove user-related foreign key constraints and references
-- This script removes the User table and updates the schema to work with Supabase Auth only

-- Drop foreign key constraints first
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_patient_id_fkey;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_doctor_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE message_reads DROP CONSTRAINT IF EXISTS message_reads_user_id_fkey;
ALTER TABLE typing_indicators DROP CONSTRAINT IF EXISTS typing_indicators_user_id_fkey;
ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_doctor_id_fkey;
ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;

-- Drop the users table
DROP TABLE IF EXISTS users CASCADE;

-- The other tables will continue to reference user IDs as strings
-- but these will now be Supabase Auth user IDs instead of database relations
