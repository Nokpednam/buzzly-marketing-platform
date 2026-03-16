-- Enable realtime for monitor tables
ALTER TABLE public.server REPLICA IDENTITY FULL;
ALTER TABLE public.data_pipeline REPLICA IDENTITY FULL;
ALTER TABLE public.error_logs REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'server') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE server;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'data_pipeline') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE data_pipeline;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'error_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE error_logs;
    END IF;
END $$;
