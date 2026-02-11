
SELECT count(*) FROM public.employees;
SELECT * FROM public.employees;
SELECT public.has_role(auth.uid(), 'owner') FROM auth.users LIMIT 1;

