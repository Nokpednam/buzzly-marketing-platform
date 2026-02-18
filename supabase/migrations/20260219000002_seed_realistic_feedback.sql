-- ============================================================
-- Seeding Realistic User Feedback
-- - Ensures Rating types exist (1-5 Stars)
-- - Generate ~100 feedback entries linked to real customers
-- - Includes negative, neutral, and positive sentiments
-- ============================================================

DO $$
DECLARE
    -- Rating IDs
    v_r1 uuid; v_r2 uuid; v_r3 uuid; v_r4 uuid; v_r5 uuid;
    
    -- Users
    v_user_ids uuid[];
    v_user_count int;
    v_user_id uuid;
    
    -- Loop vars
    i int;
    v_rating_id uuid;
    v_comment text;
    v_created_at timestamptz;
    
    -- Comment Collections
    v_positive_comments text[] := ARRAY[
        'Absolutely love this platform! It has streamlined our entire workflow.',
        'Great features and easy to use. The analytics dashboard is a game changer.',
        'Customer support is top-notch. They resolved my issue in minutes.',
        'The best investment we have made for our business this year.',
        'Intuitive interface and powerful tools. Highly recommended!',
        'I am impressed with the regular updates and new features.',
        'Exceeded my expectations. The ROI has been incredible.',
        'Simple, fast, and reliable. Exactly what we needed.',
        'The team collaboration features are excellent.',
        'Five stars! I cannot imagine working without it now.'
    ];
    
    v_neutral_comments text[] := ARRAY[
        'It is okay, but could be better. The UI feels a bit dated.',
        'Good potential, but some features are still buggy.',
        'Decent value for the price, but missing some advanced integrations.',
        'Learning curve is a bit steep for new users.',
        'It works fine for basic tasks, but struggles with large datasets.',
        'Average experience. Nothing to write home about.',
        'The mobile app needs some work, but the web version is fine.',
        'Customer service was slow to respond, but eventually fixed the issue.',
        'I wish there were more customization options.',
        'It gets the job done, but I might look for alternatives soon.'
    ];
    
    v_negative_comments text[] := ARRAY[
        'Very disappointed. The system crashes constantly.',
        'The pricing is too high for the value provided.',
        'Customer support never replied to my emails. Frustrating.',
        'Key features promised in the demo are missing.',
        'The interface is confusing and hard to navigate.',
        'Lost data twice this week. Unacceptable reliability.',
        'Way too many bugs. It feels like a beta product.',
        'I regret upgrading to the pro plan. Not worth it.',
        'Slow performance is killing our productivity.',
        'Cancelling my subscription. Found a better alternative.'
    ];

BEGIN
    -- 1. Ensure Rating Types Exist
    -- Ratings: 1 Star, 2 Stars, 3 Stars, 4 Stars, 5 Stars
    -- Columns: name, descriptions, color_code
    
    INSERT INTO public.rating (name, descriptions, color_code) VALUES ('1 Star', 'Terrible', '#ef4444') ON CONFLICT DO NOTHING;
    INSERT INTO public.rating (name, descriptions, color_code) VALUES ('2 Stars', 'Poor', '#f97316') ON CONFLICT DO NOTHING;
    INSERT INTO public.rating (name, descriptions, color_code) VALUES ('3 Stars', 'Average', '#eab308') ON CONFLICT DO NOTHING;
    INSERT INTO public.rating (name, descriptions, color_code) VALUES ('4 Stars', 'Good', '#84cc16') ON CONFLICT DO NOTHING;
    INSERT INTO public.rating (name, descriptions, color_code) VALUES ('5 Stars', 'Excellent', '#22c55e') ON CONFLICT DO NOTHING;

    SELECT id INTO v_r1 FROM public.rating WHERE name ILIKE '%1 Star%' LIMIT 1;
    SELECT id INTO v_r2 FROM public.rating WHERE name ILIKE '%2 Star%' LIMIT 1;
    SELECT id INTO v_r3 FROM public.rating WHERE name ILIKE '%3 Star%' LIMIT 1;
    SELECT id INTO v_r4 FROM public.rating WHERE name ILIKE '%4 Star%' LIMIT 1;
    SELECT id INTO v_r5 FROM public.rating WHERE name ILIKE '%5 Star%' LIMIT 1;

    -- 2. Get Users
    SELECT ARRAY(SELECT id FROM auth.users) INTO v_user_ids;
    v_user_count := array_length(v_user_ids, 1);

    IF v_user_count IS NULL THEN
        RAISE NOTICE 'No users found to seed feedback.';
        RETURN;
    END IF;

    -- 3. Seed Feedback
    -- We'll generate ~100 feedback entries
    RAISE NOTICE 'Seeding 100 Feedback entries...';
    
    FOR i IN 1..100 LOOP
        v_user_id := v_user_ids[1 + floor(random() * v_user_count)::int];
        v_created_at := NOW() - (random() * INTERVAL '180 days');
        
        -- Determine Sentiment Distribution
        -- 40% Positive, 30% Neutral, 30% Negative
        IF random() < 0.4 THEN
            -- Positive (4-5 Stars)
            v_rating_id := CASE WHEN random() < 0.7 THEN v_r5 ELSE v_r4 END;
            v_comment := v_positive_comments[1 + floor(random() * array_length(v_positive_comments, 1))::int];
        ELSIF random() < 0.7 THEN
            -- Neutral (3 Stars)
            v_rating_id := v_r3;
            v_comment := v_neutral_comments[1 + floor(random() * array_length(v_neutral_comments, 1))::int];
        ELSE
            -- Negative (1-2 Stars)
            v_rating_id := CASE WHEN random() < 0.6 THEN v_r1 ELSE v_r2 END;
            v_comment := v_negative_comments[1 + floor(random() * array_length(v_negative_comments, 1))::int];
        END IF;

        INSERT INTO public.feedback (
            id, user_id, rating_id, comment, created_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_rating_id,
            v_comment,
            v_created_at
        );
    END LOOP;
    
    RAISE NOTICE 'Feedback seeding complete.';
END $$;
