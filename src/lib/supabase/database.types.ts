export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          avatar_color: string
          bio: string | null
          rating: number
          rating_count: number
          review_count: number
          is_verified: boolean
          is_pro: boolean
          plan: 'free' | 'pro' | 'host_plus'
          total_hosted: number
          disputes: number
          avg_response_time_mins: number
          onboarding_completed: boolean
          onboarding_step: number
          onboarding_role: 'host' | 'joiner' | null
          referral_code: string | null
          referred_by: string | null
          is_admin: boolean
          is_banned: boolean
          ban_reason: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          avatar_color?: string
          bio?: string | null
          rating?: number
          rating_count?: number
          review_count?: number
          is_verified?: boolean
          is_pro?: boolean
          plan?: 'free' | 'pro' | 'host_plus'
          total_hosted?: number
          disputes?: number
          avg_response_time_mins?: number
          onboarding_completed?: boolean
          onboarding_step?: number
          onboarding_role?: 'host' | 'joiner' | null
          referral_code?: string | null
          referred_by?: string | null
          is_admin?: boolean
          is_banned?: boolean
          ban_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          avatar_color?: string
          bio?: string | null
          rating?: number
          rating_count?: number
          review_count?: number
          is_verified?: boolean
          is_pro?: boolean
          plan?: 'free' | 'pro' | 'host_plus'
          total_hosted?: number
          disputes?: number
          avg_response_time_mins?: number
          onboarding_completed?: boolean
          onboarding_step?: number
          onboarding_role?: 'host' | 'joiner' | null
          referral_code?: string | null
          referred_by?: string | null
          is_admin?: boolean
          is_banned?: boolean
          ban_reason?: string | null
          created_at?: string
        }
      }
      pools: {
        Row: {
          id: string
          owner_id: string
          platform: string
          plan_name: string
          total_cost: number | null
          total_slots: number
          filled_slots: number
          price_per_slot: number
          category: 'OTT' | 'AI_IDE' | 'productivity' | 'ai'
          status: 'open' | 'active' | 'closed'
          billing_cycle: 'monthly' | 'yearly'
          description: string | null
          auto_approve: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          platform: string
          plan_name: string
          total_cost?: number | null
          total_slots: number
          filled_slots?: number
          price_per_slot: number
          category: 'OTT' | 'AI_IDE' | 'productivity' | 'ai'
          status?: 'open' | 'active' | 'closed'
          billing_cycle?: 'monthly' | 'yearly'
          description?: string | null
          auto_approve?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          platform?: string
          plan_name?: string
          total_cost?: number | null
          total_slots?: number
          filled_slots?: number
          price_per_slot?: number
          category?: 'OTT' | 'AI_IDE' | 'productivity' | 'ai'
          status?: 'open' | 'active' | 'closed'
          billing_cycle?: 'monthly' | 'yearly'
          description?: string | null
          auto_approve?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          pool_id: string
          user_id: string
          status: 'active' | 'pending' | 'cancelled' | 'expired' | 'removed'
          price_per_slot: number
          joined_at: string
          created_at: string
          next_billing_at: string | null
          billing_anchor_day: number | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          pool_id: string
          user_id: string
          status?: 'active' | 'pending' | 'cancelled' | 'expired' | 'removed'
          price_per_slot: number
          joined_at?: string
          created_at?: string
          next_billing_at?: string | null
          billing_anchor_day?: number | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          pool_id?: string
          user_id?: string
          status?: 'active' | 'pending' | 'cancelled' | 'expired' | 'removed'
          price_per_slot?: number
          joined_at?: string
          created_at?: string
          next_billing_at?: string | null
          billing_anchor_day?: number | null
          cancelled_at?: string | null
        }
      }
      credentials: {
        Row: {
          id: string
          pool_id: string
          encrypted_data: string
          nonce: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          encrypted_data: string
          nonce: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          encrypted_data?: string
          nonce?: string
          updated_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          pool_id: string
          sender_id: string
          content: string
          read_at: string | null
          read_by: string[] | null
          reply_to_id: string | null
          message_type: string
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          sender_id: string
          content: string
          read_at?: string | null
          read_by?: string[] | null
          reply_to_id?: string | null
          message_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
          read_by?: string[] | null
          reply_to_id?: string | null
          message_type?: string
          created_at?: string
        }
      }
      ledger: {
        Row: {
          id: string
          membership_id: string
          amount: number
          due_date: string
          status: 'owed' | 'paid'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          amount: number
          due_date: string
          status?: 'owed' | 'paid'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          membership_id?: string
          amount?: number
          due_date?: string
          status?: 'owed' | 'paid'
          paid_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          icon: string | null
          title: string
          body: string
          read: boolean
          action_url: string | null
          source_id: string | null
          source_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          icon?: string | null
          title: string
          body: string
          read?: boolean
          action_url?: string | null
          source_id?: string | null
          source_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          icon?: string | null
          title?: string
          body?: string
          read?: boolean
          action_url?: string | null
          source_id?: string | null
          source_type?: string | null
          created_at?: string
        }
      }
      wishlist_requests: {
        Row: {
          id: string
          user_id: string
          platform: string
          budget_max: number
          urgency: 'low' | 'medium' | 'high'
          status: 'open' | 'fulfilled' | 'expired' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          budget_max: number
          urgency: 'low' | 'medium' | 'high'
          status?: 'open' | 'fulfilled' | 'expired' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          budget_max?: number
          urgency?: 'low' | 'medium' | 'high'
          status?: 'open' | 'fulfilled' | 'expired' | 'cancelled'
          created_at?: string
        }
      }
      pool_waitlist: {
        Row: {
          id: string
          pool_id: string
          user_id: string
          position: number
          status: 'waiting' | 'notified' | 'joined' | 'expired' | 'cancelled'
          notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          user_id: string
          position: number
          status?: 'waiting' | 'notified' | 'joined' | 'expired' | 'cancelled'
          notified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          user_id?: string
          position?: number
          status?: 'waiting' | 'notified' | 'joined' | 'expired' | 'cancelled'
          notified_at?: string | null
          created_at?: string
        }
      }
      join_requests: {
        Row: {
          id: string
          pool_id: string
          requester_id: string
          message: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          requester_id: string
          message?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          requester_id?: string
          message?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: 'web' | 'ios' | 'android'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          platform: 'web' | 'ios' | 'android'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          platform?: 'web' | 'ios' | 'android'
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          pool_id: string
          rater_id: string
          rated_id: string
          score: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          rater_id: string
          rated_id: string
          score: number
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          rater_id?: string
          rated_id?: string
          score?: number
          review?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          referral_code: string
          signup_at: string
          reward_granted: boolean
          reward_type: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          referral_code: string
          signup_at?: string
          reward_granted?: boolean
          reward_type?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          referral_code?: string
          signup_at?: string
          reward_granted?: boolean
          reward_type?: string | null
        }
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
      }
    }
    Views: {
      host_earnings_summary: {
        Row: {
          host_id: string
          pool_id: string
          platform: string
          plan_name: string
          paid_count: number
          pending_count: number
          total_earned: number
          total_pending: number
          last_payout_at: string | null
        }
      }
    }
    Functions: {
      get_monthly_earnings: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          earned: number
          pending: number
        }[]
      }
      process_referral: {
        Args: {
          p_referral_code: string
          p_new_user_id: string
        }
        Returns: {
          ok: boolean
          referrer_id?: string
          error?: string
        }
      }
      join_waitlist: {
        Args: {
          p_pool_id: string
        }
        Returns: {
          ok: boolean
          position?: number
          error?: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
