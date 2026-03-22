export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TrackingMode = 'quantity' | 'unit'
export type IdentifierKind = 'imei' | 'serial' | 'other'
export type InventoryUnitStatus = 'in_stock' | 'sold'

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          type: string
          price: number
          stock_quantity: number
          /** Present after serialized-inventory migration; treat missing as quantity */
          tracking_mode?: TrackingMode
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string
          price: number
          stock_quantity?: number
          tracking_mode?: TrackingMode
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          price?: number
          stock_quantity?: number
          tracking_mode?: TrackingMode
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          sold_by: string
          customer_name: string
          customer_phone: string
          created_at: string
        }
        Insert: {
          id?: string
          sold_by: string
          customer_name: string
          customer_phone: string
          created_at?: string
        }
        Update: {
          id?: string
          sold_by?: string
          customer_name?: string
          customer_phone?: string
          created_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          unit_price: number
          quantity_sold: number
          inventory_unit_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          unit_price: number
          quantity_sold: number
          inventory_unit_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          unit_price?: number
          quantity_sold?: number
          inventory_unit_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sale_items_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'sales'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_inventory_unit_id_fkey'
            columns: ['inventory_unit_id']
            isOneToOne: false
            referencedRelation: 'inventory_units'
            referencedColumns: ['id']
          },
        ]
      }
      inventory_units: {
        Row: {
          id: string
          product_id: string
          identifier: string
          identifier_kind: IdentifierKind
          status: InventoryUnitStatus
          sold_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          identifier: string
          identifier_kind: IdentifierKind
          status?: InventoryUnitStatus
          sold_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          identifier?: string
          identifier_kind?: IdentifierKind
          status?: InventoryUnitStatus
          sold_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_units_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string
          role: 'admin' | 'staff'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          role?: 'admin' | 'staff'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'admin' | 'staff'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      sale_line_details: {
        Row: {
          sale_item_id: string
          sale_id: string
          sale_created_at: string
          sold_by: string
          customer_name: string
          customer_phone: string
          product_name: string
          quantity_sold: number
          unit_price: number
          unit_identifier: string | null
          unit_identifier_kind: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { p_uid?: string }
        Returns: boolean
      }
      record_sale: {
        Args: {
          p_items: Json
          p_sold_by: string
          p_customer_name: string
          p_customer_phone: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert']
export type InventoryUnit = Database['public']['Tables']['inventory_units']['Row']
export type InventoryUnitInsert = Database['public']['Tables']['inventory_units']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type SaleLineDetailsView = Database['public']['Views']['sale_line_details']['Row']
