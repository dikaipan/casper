-- Update existing cassettes with old enum values to new ones
UPDATE cassettes 
SET status = 'OK' 
WHERE status = 'INSTALLED' OR status = 'SPARE_POOL';

-- Update existing problem_tickets with old enum values to new ones  
UPDATE problem_tickets
SET status = 'OPEN'
WHERE status = 'APPROVED' OR status = 'PENDING_VENDOR' OR status = 'PENDING_RC';

