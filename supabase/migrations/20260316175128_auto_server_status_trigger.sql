-- Migration to auto-compute server status based on CPU, Memory, and Disk usage
-- Formula:
-- Critical if: CPU > 90% OR Disk > 95% OR Memory > 95%
-- Warning if: CPU > 80% OR Disk > 85% OR Memory > 85%
-- Healthy otherwise

CREATE OR REPLACE FUNCTION compute_server_status()
RETURNS TRIGGER AS $$
DECLARE
    mem_usage_pct NUMERIC;
    disk_usage_pct NUMERIC;
BEGIN
    -- Calculate memory usage percentage
    IF NEW.total_memory > 0 THEN
        mem_usage_pct := (NEW.used_memory::numeric / NEW.total_memory::numeric) * 100;
    ELSE
        mem_usage_pct := 0;
    END IF;

    -- Calculate disk usage percentage
    IF NEW.disk_total > 0 THEN
        disk_usage_pct := (NEW.disk_used::numeric / NEW.disk_total::numeric) * 100;
    ELSE
        disk_usage_pct := 0;
    END IF;

    -- Determine status based on thresholds
    IF COALESCE(NEW.cpu_usage_percent, 0) > 90 OR disk_usage_pct > 95 OR mem_usage_pct > 95 THEN
        NEW.status := 'critical';
    ELSIF COALESCE(NEW.cpu_usage_percent, 0) > 80 OR disk_usage_pct > 85 OR mem_usage_pct > 85 THEN
        NEW.status := 'warning';
    ELSE
        NEW.status := 'healthy';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to allow safe re-runs
DROP TRIGGER IF EXISTS trg_server_status ON public.server;

-- Create the trigger
CREATE TRIGGER trg_server_status
BEFORE INSERT OR UPDATE OF cpu_usage_percent, used_memory, total_memory, disk_used, disk_total
ON public.server
FOR EACH ROW
EXECUTE FUNCTION compute_server_status();

-- Force an update on all existing rows to compute their immediate status
UPDATE public.server SET last_update = NOW();
