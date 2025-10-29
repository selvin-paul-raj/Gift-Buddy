"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { markContributionAsPaid } from "@/lib/actions/markPayment";
import { CheckCircle2, Clock, Gift, Calendar, Copy, ChevronDown } from "lucide-react";
import type { EventData } from "@/lib/types/shared.types";

interface UserEventCardProps {
  event: EventData;
}

export default function UserEventCard({ event }: UserEventCardProps) {
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  
  const eventDate = new Date(event.eventDate);
  const today = new Date();
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error(`Failed to copy ${fieldName}`);
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      await markContributionAsPaid(event.eventId);
      toast.success("✅ Payment marked as complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark payment");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = event.paid
    ? { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-900/50", badgeBg: "bg-green-100 dark:bg-green-900/50", badgeText: "text-green-700 dark:text-green-300", icon: "text-green-600 dark:text-green-400" }
    : { bg: "bg-blue-50 dark:bg-slate-900/50", border: "border-blue-200 dark:border-slate-700", badgeBg: "bg-blue-100 dark:bg-blue-900/30", badgeText: "text-blue-700 dark:text-blue-300", icon: "text-blue-600 dark:text-blue-400" };

  const daysConfig = daysUntil <= 3
    ? { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300" }
    : daysUntil <= 7
    ? { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-300" }
    : { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300" };

  return (
    <Card className={`overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${statusConfig.border} ${statusConfig.bg}`}>
      <CardContent className="p-3 md:p-6 space-y-3">
        {/* Header - Always visible */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎂</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">{event.eventTitle}</h3>
                  <p className="text-xs text-muted-foreground truncate">{event.birthdayPersonName}'s celebration</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={`text-xs ${statusConfig.badgeBg} ${statusConfig.badgeText} border-0`}>
                {event.paid ? "✓ Paid" : "Pending"}
              </Badge>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          {/* Quick Info */}
          <div className={`mt-2 flex items-center justify-between gap-2 p-2 rounded-lg text-sm ${daysConfig.bg}`}>
            <div className="flex items-center gap-1">
              <Calendar size={14} className={statusConfig.icon} />
              <span className="font-medium">
                {eventDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="font-bold">₹{formatCurrency(event.userSplitAmount)}</div>
            {daysUntil > 0 && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${daysConfig.text}`}>
                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
              </span>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {(expanded || window.innerWidth >= 768) && (
          <>
            <div className="h-px bg-border" />

            {/* Amount Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className={statusConfig.icon} />
                <h4 className="text-sm font-semibold text-foreground">Gifts</h4>
              </div>
              
              {/* Gift List with Links */}
              <div className="space-y-1.5">
                {event.gifts.map((gift, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-secondary/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex-shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{gift.name}</p>
                          {gift.link && (
                            <a 
                              href={gift.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                            >
                              View gift →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">₹{formatCurrency(gift.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Gifts */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50 mt-2 border border-primary/20">
                <div>
                  <p className="text-xs text-muted-foreground">Total Gift Cost</p>
                  <p className="text-sm font-medium text-foreground">₹{formatCurrency(event.totalGiftAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Your Share</p>
                  <p className="text-lg font-bold text-foreground">₹{formatCurrency(event.userSplitAmount)}</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {(event.userUPI || event.userPhone) && (
              <>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">💳 Payment Details</p>
                  {event.userUPI && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">UPI</p>
                        <p className="text-sm font-mono text-foreground truncate">{event.userUPI}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(event.userUPI || "", "UPI")} 
                        className="p-2 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
                      >
                        {copiedField === "UPI" ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} className="text-muted-foreground" />}
                      </button>
                    </div>
                  )}
                  {event.userPhone && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-mono text-foreground truncate">{event.userPhone}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(event.userPhone || "", "Phone")} 
                        className="p-2 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
                      >
                        {copiedField === "Phone" ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} className="text-muted-foreground" />}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Status and Action */}
            {!event.paid && (
              <Button 
                onClick={handleMarkPaid} 
                disabled={loading} 
                className="w-full h-10 font-semibold"
              >
                {loading ? "Processing..." : "Mark as Paid"}
              </Button>
            )}

            {event.paid && event.paymentTime && (
              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300">Payment Complete</p>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Paid on {new Date(event.paymentTime).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
