import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function test() {
    const { data, error } = await supabase
        .from("discounts")
        .insert({
            team_id: '123e4567-e89b-12d3-a456-426614174000',
            created_by: '123e4567-e89b-12d3-a456-426614174000',
            code: 'TESTCODE123',
            name: 'Test Name',
            discount_type: 'percent',
            discount_value: 10,
            min_order_value: 0,
            max_discount_amount: null,
            usage_limit: null,
            start_date: null,
            end_date: null,
            description: null,
        });
    console.log(error);
}
test();
