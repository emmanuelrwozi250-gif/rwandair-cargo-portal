-- ============================================================
-- Migration 004 — Drop the agent-portal vertical
-- Run in the Supabase SQL editor. Removes the freight-agent account system
-- (migration 003) plus the agent_enquiries table (from 002). The exporter
-- account system (users/exporters/shipments) and the claims/reviews/feedback/
-- news tables are NOT touched.
-- Safe to run once; uses IF EXISTS / CASCADE.
-- ============================================================

-- Tables (CASCADE drops their RLS policies, indexes, triggers, FKs)
drop table if exists public.contract_rates       cascade;
drop table if exists public.agent_notifications  cascade;
drop table if exists public.agent_invoices       cascade;
drop table if exists public.eawbs                cascade;
drop table if exists public.agent_bookings       cascade;
drop table if exists public.profiles             cascade;
drop table if exists public.agent_enquiries      cascade;

-- Functions + the auth signup trigger that created profile rows
drop trigger  if exists on_auth_user_created_profile on auth.users;
drop function if exists public.handle_new_profile() cascade;
drop function if exists public.agent_account_id()   cascade;

-- Enums
drop type if exists public.account_role;
drop type if exists public.agent_status;
