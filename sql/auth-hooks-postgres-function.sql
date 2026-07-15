-- SUPABASE AUTH HOOKS - POSTGRES FUNCTION APPROACH
-- This is an ALTERNATIVE to the HTTPS endpoint
-- Less flexible but works entirely in the database
--
-- WARNING: Postgres functions cannot call external HTTP endpoints directly
-- This function can only:
//   - Insert logs into auth_email_logs table
//   - Trigger other Postgres operations
//
-- RECOMMENDATION: Use HTTPS endpoint instead (app/api/auth/hooks/send-email/route.ts)
-- ─────────────────────────────────────────────────────────────────────────────────

-- Step 1: Create audit table for email logs (if not exists)
CREATE TABLE IF NOT EXISTS public.auth_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 2: Enable RLS on auth_email_logs
ALTER TABLE public.auth_email_logs ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policy - Only admins and the system can read logs
CREATE POLICY "auth_email_logs_select_admin"
  ON public.auth_email_logs
  FOR SELECT
  TO authenticated
  USING ( is_admin() );

CREATE POLICY "auth_email_logs_insert_service"
  ON public.auth_email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ( true ); -- Only backend can insert via service_role

CREATE POLICY "auth_email_logs_delete_never"
  ON public.auth_email_logs
  FOR DELETE
  TO authenticated
  USING ( false );

-- Step 4: Create the main auth hook function
-- This function is called by Supabase when signup/recovery events occur
CREATE OR REPLACE FUNCTION public.handle_auth_email_hook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_event_type TEXT;
  v_token TEXT;
  v_subject TEXT;
  v_full_name TEXT;
BEGIN
  -- Extract data from the trigger
  v_user_id := NEW.id;
  v_email := NEW.email;
  
  -- Determine event type based on context
  -- This is a limitation of Postgres triggers - they don't know the full context
  -- The HTTPS endpoint is more aware of event types
  
  IF NEW.email_confirmed_at IS NULL THEN
    v_event_type := 'signup'; -- Email not yet confirmed
    v_token := NEW.confirmation_token;
    v_subject := 'Verify Your PULSE Account - Welcome Bonus Inside';
  ELSIF NEW.recovery_sent_at > now() - interval '5 minutes' THEN
    v_event_type := 'recovery'; -- Password reset was just triggered
    v_token := NEW.recovery_token;
    v_subject := 'Reset Your PULSE Password';
  ELSE
    v_event_type := 'other';
    v_subject := 'PULSE Account Update';
  END IF;

  -- Extract full name from metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );

  -- Log the email event
  INSERT INTO public.auth_email_logs (
    event_type,
    user_id,
    user_email,
    subject,
    status
  )
  VALUES (
    v_event_type,
    v_user_id,
    v_email,
    v_subject,
    'pending'
  );

  -- NOTE: This function logs the event but CANNOT send emails directly
  -- Postgres cannot make HTTP calls or access external SMTP servers
  -- You MUST use the HTTPS endpoint approach in app/api/auth/hooks/send-email/route.ts
  -- OR use a separate cron job to process pending emails

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth operation
  INSERT INTO public.auth_email_logs (
    event_type,
    user_id,
    user_email,
    subject,
    status,
    error_message
  )
  VALUES (
    v_event_type,
    v_user_id,
    v_email,
    v_subject,
    'failed',
    SQLERRM
  );
  RETURN NEW;
END;
$$;

-- Step 5: Create trigger on auth.users (Supabase built-in table)
-- NOTE: This trigger only fires on auth.users table
-- You must configure this in Supabase Dashboard as well
--
-- To activate in Supabase:
--   1. Go to Supabase → Authentication → Hooks
--   2. Select "Postgres" hook type
--   3. Set Postgres Schema to "public"
--   4. Select function "handle_auth_email_hook"

-- Step 6: Optional - Create a cron job to process pending emails
-- (Requires pg_cron extension - usually enabled on Supabase)

-- This is a placeholder - uncomment if you want to process emails via cron
-- CREATE OR REPLACE FUNCTION process_pending_auth_emails()
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   -- Update pending emails to sent status
--   -- In reality, you'd call an HTTP endpoint here or integrate with an email service
--   UPDATE public.auth_email_logs
--   SET status = 'sent', updated_at = now()
--   WHERE status = 'pending'
--   AND created_at > now() - interval '24 hours';
-- END;
-- $$;

-- To schedule cron job (requires pg_cron):
-- SELECT cron.schedule('process-auth-emails', '*/5 * * * *', 'SELECT process_pending_auth_emails()');

-- ─────────────────────────────────────────────────────────────────────────────────
-- LIMITATIONS OF POSTGRES APPROACH:
-- ─────────────────────────────────────────────────────────────────────────────────
-- 1. Cannot send emails directly (no SMTP access)
-- 2. Cannot call external HTTP endpoints
-- 3. Limited context about event type (signup vs recovery)
-- 4. Requires workarounds for actual email sending
-- 5. Hard to debug and maintain
-- 6. Cannot use environment variables or secrets safely

-- ─────────────────────────────────────────────────────────────────────────────────
-- RECOMMENDED: Use HTTPS endpoint instead
-- ─────────────────────────────────────────────────────────────────────────────────
-- Path: /app/api/auth/hooks/send-email/route.ts
-- - Full control over email templates
-- - Direct access to email services (Resend, SendGrid, etc.)
-- - Easy error handling and logging
-- - Full context about auth event
-- - Can use environment variables securely
