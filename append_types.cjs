const fs = require('fs');
const path = require('path');

const typesPath = path.join(process.cwd(), 'src', 'integrations', 'supabase', 'types.ts');
let content = fs.readFileSync(typesPath, 'utf-8');

const newTypes = `
      point_earning_rules: {
        Row: {
          action_code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_times_per_user: number | null
          name: string
          points_reward: number
          updated_at: string | null
        }
        Insert: {
          action_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_times_per_user?: number | null
          name: string
          points_reward: number
          updated_at?: string | null
        }
        Update: {
          action_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_times_per_user?: number | null
          name?: string
          points_reward?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_cost: number
          reward_type: string
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_cost: number
          reward_type: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_cost?: number
          reward_type?: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          admin_notes: string | null
          fulfilled_at: string | null
          id: string
          points_transaction_id: string | null
          redeemed_at: string | null
          redemption_code: string | null
          reward_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          fulfilled_at?: string | null
          id?: string
          points_transaction_id?: string | null
          redeemed_at?: string | null
          redemption_code?: string | null
          reward_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          fulfilled_at?: string | null
          id?: string
          points_transaction_id?: string | null
          redeemed_at?: string | null
          redemption_code?: string | null
          reward_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          }
        ]
      }
      user_completed_rules: {
        Row: {
          completed_at: string | null
          id: string
          points_transaction_id: string | null
          rule_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          points_transaction_id?: string | null
          rule_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          points_transaction_id?: string | null
          rule_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_completed_rules_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_completed_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "point_earning_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_completed_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          }
        ]
      }`;

if (!content.includes('point_earning_rules: {')) {
    const tableInsertPoint = content.indexOf('Tables: {') + 9;
    content = content.slice(0, tableInsertPoint) + newTypes + ',' + content.slice(tableInsertPoint);
    fs.writeFileSync(typesPath, content, 'utf-8');
    console.log("Appended new tables to types.ts successfully!");
} else {
    console.log("Types already appended.");
}
