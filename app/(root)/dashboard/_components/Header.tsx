"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, TrendingUp, Loader2 } from 'lucide-react'

const Header = () => {
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    const fetchTotalSpent = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        // Get all contributions for the current user
        const { data: contributions, error } = await supabase
          .from('contributions')
          .select('split_amount, paid')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching contributions:', error)
          setError('Failed to load spending data')
          setLoading(false)
          return
        }

        // Calculate total spent (only paid contributions)
        const total = contributions
          ?.filter(c => c.paid)
          ?.reduce((sum, c) => sum + (c.split_amount || 0), 0) || 0

        setTotalSpent(Math.round(total) / 100) // Convert from paise to rupees
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load spending data')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalSpent()
  }, [])

  return (
    <div className="space-y-2">
      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎂</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Upcoming Celebrations
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Track your birthday contributions and stay updated with celebrations
          </p>
        </div>

        {/* Stats Card */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-card border border-border rounded-lg p-4 backdrop-blur-sm hover:border-border/80 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Spent
                </p>
                <div className="flex items-baseline gap-1">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                      <span className="text-2xl font-bold text-foreground">—</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-foreground">₹{formatCurrency(totalSpent)}</span>
                      <span className="text-xs text-muted-foreground">INR</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-border via-border to-transparent" />
    </div>
  )
}

export default Header