-- Migration: add MessageType enum and type columns to messages and direct_messages

-- 1) Create enum MessageType if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'messagetype') THEN
    CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE');
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- already exists
END$$;

-- 2) Add column 'type' to messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'type'
  ) THEN
    ALTER TABLE "messages" ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'TEXT';
  END IF;
END$$;

-- 3) Add column 'type' to direct_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'direct_messages' AND column_name = 'type'
  ) THEN
    ALTER TABLE "direct_messages" ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'TEXT';
  END IF;
END$$;
