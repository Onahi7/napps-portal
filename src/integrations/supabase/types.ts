export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      editorial_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          editor_id: string
          editor_role: string
          id: string
          is_active: boolean | null
          manuscript_id: string
          notes: string | null
          specialization: string[] | null
          workload_weight: number | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          editor_id: string
          editor_role: string
          id?: string
          is_active?: boolean | null
          manuscript_id: string
          notes?: string | null
          specialization?: string[] | null
          workload_weight?: number | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          editor_id?: string
          editor_role?: string
          id?: string
          is_active?: boolean | null
          manuscript_id?: string
          notes?: string | null
          specialization?: string[] | null
          workload_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "editorial_assignments_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "editorial_assignments_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_communications: {
        Row: {
          from_user_id: string
          id: string
          is_read: boolean | null
          manuscript_id: string
          message: string
          message_type: string
          sent_at: string | null
          subject: string
          to_user_id: string
        }
        Insert: {
          from_user_id: string
          id?: string
          is_read?: boolean | null
          manuscript_id: string
          message: string
          message_type: string
          sent_at?: string | null
          subject: string
          to_user_id: string
        }
        Update: {
          from_user_id?: string
          id?: string
          is_read?: boolean | null
          manuscript_id?: string
          message?: string
          message_type?: string
          sent_at?: string | null
          subject?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_communications_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "editorial_communications_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_communications_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      editorial_decisions: {
        Row: {
          comments: string | null
          decision: string
          decision_date: string | null
          editor_id: string
          editor_role: string
          id: string
          is_final: boolean | null
          manuscript_id: string
          recommendation_to_eic: string | null
        }
        Insert: {
          comments?: string | null
          decision: string
          decision_date?: string | null
          editor_id: string
          editor_role: string
          id?: string
          is_final?: boolean | null
          manuscript_id: string
          recommendation_to_eic?: string | null
        }
        Update: {
          comments?: string | null
          decision?: string
          decision_date?: string | null
          editor_id?: string
          editor_role?: string
          id?: string
          is_final?: boolean | null
          manuscript_id?: string
          recommendation_to_eic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_decisions_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "editorial_decisions_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          content: string
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          sender_email: string | null
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sender_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sender_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: string
          is_enabled: boolean | null
          last_sent: string | null
          notification_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sent?: string | null
          notification_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sent?: string | null
          notification_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          description: string | null
          file_category: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_active: boolean | null
          manuscript_id: string | null
          mime_type: string | null
          submission_draft_id: string | null
          uploaded_at: string | null
          uploaded_by: string
          version_number: number | null
        }
        Insert: {
          description?: string | null
          file_category: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_active?: boolean | null
          manuscript_id?: string | null
          mime_type?: string | null
          submission_draft_id?: string | null
          uploaded_at?: string | null
          uploaded_by: string
          version_number?: number | null
        }
        Update: {
          description?: string | null
          file_category?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_active?: boolean | null
          manuscript_id?: string | null
          mime_type?: string | null
          submission_draft_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_submission_draft_id_fkey"
            columns: ["submission_draft_id"]
            isOneToOne: false
            referencedRelation: "submission_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      journal_issues: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          issue_number: number
          publication_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          volume_number: number
          year: number
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          issue_number: number
          publication_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          volume_number: number
          year: number
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          issue_number?: number
          publication_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          volume_number?: number
          year?: number
        }
        Relationships: []
      }
      manuscript_reviewers: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          due_date: string | null
          id: string
          is_active: boolean | null
          manuscript_id: string
          reviewer_id: string
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          manuscript_id: string
          reviewer_id: string
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          manuscript_id?: string
          reviewer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_reviewers_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "manuscript_reviewers_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manuscript_reviewers_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      manuscripts: {
        Row: {
          abstract: string
          author_id: string
          co_authors: Json | null
          conflicts_of_interest: string | null
          corresponding_author_email: string | null
          created_at: string | null
          data_availability: string | null
          enhanced_status: string | null
          ethical_approval: string | null
          figure_count: number | null
          files: Json | null
          funding_info: string | null
          id: string
          keywords: string[] | null
          manuscript_type: string | null
          page_count: number | null
          priority_level: number | null
          reference_count: number | null
          status: string | null
          submission_checklist: Json | null
          submitted_at: string | null
          table_count: number | null
          title: string
          updated_at: string | null
          word_count: number | null
          workflow_metadata: Json | null
        }
        Insert: {
          abstract: string
          author_id: string
          co_authors?: Json | null
          conflicts_of_interest?: string | null
          corresponding_author_email?: string | null
          created_at?: string | null
          data_availability?: string | null
          enhanced_status?: string | null
          ethical_approval?: string | null
          figure_count?: number | null
          files?: Json | null
          funding_info?: string | null
          id?: string
          keywords?: string[] | null
          manuscript_type?: string | null
          page_count?: number | null
          priority_level?: number | null
          reference_count?: number | null
          status?: string | null
          submission_checklist?: Json | null
          submitted_at?: string | null
          table_count?: number | null
          title: string
          updated_at?: string | null
          word_count?: number | null
          workflow_metadata?: Json | null
        }
        Update: {
          abstract?: string
          author_id?: string
          co_authors?: Json | null
          conflicts_of_interest?: string | null
          corresponding_author_email?: string | null
          created_at?: string | null
          data_availability?: string | null
          enhanced_status?: string | null
          ethical_approval?: string | null
          figure_count?: number | null
          files?: Json | null
          funding_info?: string | null
          id?: string
          keywords?: string[] | null
          manuscript_type?: string | null
          page_count?: number | null
          priority_level?: number | null
          reference_count?: number | null
          status?: string | null
          submission_checklist?: Json | null
          submitted_at?: string | null
          table_count?: number | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
          workflow_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscripts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean | null
          frequency: string | null
          id: string
          notification_type: string
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          email_enabled?: boolean | null
          frequency?: string | null
          id?: string
          notification_type: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          email_enabled?: boolean | null
          frequency?: string | null
          id?: string
          notification_type?: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message_template: string
          name: string
          subject_template: string
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template: string
          name: string
          subject_template: string
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          name?: string
          subject_template?: string
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      peer_reviews: {
        Row: {
          confidential_comments: string | null
          detailed_comments: Json | null
          id: string
          is_complete: boolean | null
          manuscript_id: string
          overall_comments: string | null
          overall_recommendation: string
          review_quality_score: number | null
          reviewer_id: string
          submitted_at: string | null
          time_spent_hours: number | null
        }
        Insert: {
          confidential_comments?: string | null
          detailed_comments?: Json | null
          id?: string
          is_complete?: boolean | null
          manuscript_id: string
          overall_comments?: string | null
          overall_recommendation: string
          review_quality_score?: number | null
          reviewer_id: string
          submitted_at?: string | null
          time_spent_hours?: number | null
        }
        Update: {
          confidential_comments?: string | null
          detailed_comments?: Json | null
          id?: string
          is_complete?: boolean | null
          manuscript_id?: string
          overall_comments?: string | null
          overall_recommendation?: string
          review_quality_score?: number | null
          reviewer_id?: string
          submitted_at?: string | null
          time_spent_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_reviews_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      production_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          manuscript_id: string
          priority: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          manuscript_id: string
          priority?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          manuscript_id?: string
          priority?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "production_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "production_tasks_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          affiliation: string | null
          bio: string | null
          created_at: string | null
          email: string
          is_active: boolean | null
          name: string
          orcid: string | null
          specializations: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affiliation?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          is_active?: boolean | null
          name: string
          orcid?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affiliation?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          is_active?: boolean | null
          name?: string
          orcid?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      published_articles: {
        Row: {
          altmetric_score: number | null
          article_number: string | null
          citation_count: number | null
          created_at: string | null
          doi: string | null
          download_count: number | null
          id: string
          issue_id: string | null
          manuscript_id: string
          online_publication_date: string | null
          page_end: number | null
          page_start: number | null
          publication_date: string | null
          updated_at: string | null
        }
        Insert: {
          altmetric_score?: number | null
          article_number?: string | null
          citation_count?: number | null
          created_at?: string | null
          doi?: string | null
          download_count?: number | null
          id?: string
          issue_id?: string | null
          manuscript_id: string
          online_publication_date?: string | null
          page_end?: number | null
          page_start?: number | null
          publication_date?: string | null
          updated_at?: string | null
        }
        Update: {
          altmetric_score?: number | null
          article_number?: string | null
          citation_count?: number | null
          created_at?: string | null
          doi?: string | null
          download_count?: number | null
          id?: string
          issue_id?: string | null
          manuscript_id?: string
          online_publication_date?: string | null
          page_end?: number | null
          page_start?: number | null
          publication_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "published_articles_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "journal_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_articles_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_conflicts: {
        Row: {
          author_id: string | null
          conflict_type: string
          description: string | null
          id: string
          is_active: boolean | null
          manuscript_id: string | null
          reported_at: string | null
          reviewer_id: string
        }
        Insert: {
          author_id?: string | null
          conflict_type: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          manuscript_id?: string | null
          reported_at?: string | null
          reviewer_id: string
        }
        Update: {
          author_id?: string | null
          conflict_type?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          manuscript_id?: string | null
          reported_at?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_conflicts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviewer_conflicts_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviewer_conflicts_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reviewer_invitations: {
        Row: {
          due_date: string | null
          id: string
          invitation_message: string | null
          invited_at: string | null
          invited_by: string
          manuscript_id: string
          responded_at: string | null
          response_message: string | null
          reviewer_id: string
          status: string | null
        }
        Insert: {
          due_date?: string | null
          id?: string
          invitation_message?: string | null
          invited_at?: string | null
          invited_by: string
          manuscript_id: string
          responded_at?: string | null
          response_message?: string | null
          reviewer_id: string
          status?: string | null
        }
        Update: {
          due_date?: string | null
          id?: string
          invitation_message?: string | null
          invited_at?: string | null
          invited_by?: string
          manuscript_id?: string
          responded_at?: string | null
          response_message?: string | null
          reviewer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviewer_invitations_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviewer_invitations_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scheduled_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      status_transitions: {
        Row: {
          automated: boolean | null
          changed_at: string | null
          changed_by: string | null
          from_status: string | null
          id: string
          manuscript_id: string
          notes: string | null
          to_status: string
        }
        Insert: {
          automated?: boolean | null
          changed_at?: string | null
          changed_by?: string | null
          from_status?: string | null
          id?: string
          manuscript_id: string
          notes?: string | null
          to_status: string
        }
        Update: {
          automated?: boolean | null
          changed_at?: string | null
          changed_by?: string | null
          from_status?: string | null
          id?: string
          manuscript_id?: string
          notes?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_transitions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "status_transitions_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_drafts: {
        Row: {
          created_at: string | null
          current_step: number | null
          form_data: Json | null
          id: string
          last_saved: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          form_data?: Json | null
          id?: string
          last_saved?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          form_data?: Json | null
          id?: string
          last_saved?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          max_workload: number | null
          notes: string | null
          role: string
          specializations: string[] | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          max_workload?: number | null
          notes?: string | null
          role: string
          specializations?: string[] | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          max_workload?: number | null
          notes?: string | null
          role?: string
          specializations?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workflow_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          manuscript_id: string
          notes: string | null
          triggered_at: string | null
          triggered_by: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          manuscript_id: string
          notes?: string | null
          triggered_at?: string | null
          triggered_by?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          manuscript_id?: string
          notes?: string | null
          triggered_at?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_events_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_events_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_reviewer_for_manuscript: {
        Args: { manuscript_id_param: string; user_id_param: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          activity_description: string
          activity_metadata?: Json
          activity_type: string
          target_manuscript_id?: string
        }
        Returns: string
      }
      update_manuscript_status: {
        Args: {
          manuscript_id_param: string
          new_status: Database["public"]["Enums"]["manuscript_status"]
          status_comment?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "reviewer" | "author"
      manuscript_status:
        | "submitted"
        | "under-review"
        | "revision-required"
        | "accepted"
        | "rejected"
        | "published"
      manuscript_type:
        | "original-research"
        | "review-article"
        | "case-study"
        | "editorial"
        | "letter-to-editor"
      review_recommendation:
        | "accept"
        | "minor-revision"
        | "major-revision"
        | "reject"
      review_status: "pending" | "in-progress" | "completed" | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "reviewer", "author"],
      manuscript_status: [
        "submitted",
        "under-review",
        "revision-required",
        "accepted",
        "rejected",
        "published",
      ],
      manuscript_type: [
        "original-research",
        "review-article",
        "case-study",
        "editorial",
        "letter-to-editor",
      ],
      review_recommendation: [
        "accept",
        "minor-revision",
        "major-revision",
        "reject",
      ],
      review_status: ["pending", "in-progress", "completed", "overdue"],
    },
  },
} as const
