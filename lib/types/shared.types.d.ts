export type Currency = "IDR" | "USD";

/* ===========================
   DASHBOARD STATS
   =========================== 
*/
export interface StatsProps {
   activeEvents: number;
   activeEventsChange: string;
   totalMembers: number;
   totalMembersChange: string;
   collected: string;
   collectedChange: string;
   participation: string;
   participationChange: string;
}

/* ===========================
   PAYMENT STATS
   =========================== 
*/
export interface Participant {
   user_id: string;
   amount: number;
   paid: boolean;
   users?: { id: string; name: string };
};

export interface PaymentStatusProps {
   participants: Participant[];
   paidCount: number;
   totalAmount: number;
   collectedAmount: number;
   onTogglePaid: (userId: string) => Promise<void>;
   eventId: string;
   currency: string;
   disabled?: boolean;
};

/* ===========================
   EVENT
   =========================== 
*/
export interface EventDetailProps {
   event: any;
   contributions: any[];
   food: { id: string; title: string; votes: { user_id: string; users: { name: string } }[] }[];
   currentUserId: string;
};

export interface EventRow {
   id: string;
   date: string;
   note: string | null;
   status: string;
   teams: { name: string } | null;
   birthday_person: { name: string } | null;
};

export interface EventHistoryRow {
   id: string;
   date: string;
   note: string | null;
   status: string;
   teams: { name: string } | null;
   birthday_person: { name: string } | null;
   contributions: { amount: number; paid: boolean }[];
   food_options: { id: string; title: string; votes: { id: string }[] }[];
};
/* ===========================
   FOOD
   =========================== 
*/
export interface Food {
   id: string;
   title: string;
   votes: { user_id: string; users: { name: string } }[];
};

export interface FoodPollProps {
   foodPoll: Food[];
   userVote: string | null;
   totalVoters: number;
   onVote: (foodId: string) => Promise<void>;
   disabled?: boolean;
};



export interface AdminStats {
   totalUsers: number;
   activeTeams: number;
   activeEvents: number;
   totalContributions: number;
 }
 
 /** USERS */
 export interface AdminUserRow {
   id: string;
   name: string | null;
   birthday: string | null;
   // We don't have email in public.users (unless you made a view).
   email: string | null;
 }
 
 /** TEAMS */
 export interface AdminTeamRow {
   id: string;
   name: string;
   currency: Currency;
   created_at: string;
 }
 
 /** EVENTS */
 export type EventStatus = "planning" | "active" | "done" | "cancelled";
 
 export interface AdminEventRow {
   id: string;
   team_id: string;
   date: string;
   status: EventStatus;
   note: string | null;
   title: string;
   created_at: string;
   teams: { name: string } | null;
   birthday_person: { name: string } | null;
 }
 
 /** CONTRIBUTIONS */
 export interface AdminContributionRow {
   id: string;
   event_id: string;
   user_id: string;
   split_amount: number;
   paid: boolean;
   created_at: string;
   users: { name: string | null } | null;
   events: { date: string; title?: string; giftNames?: string } | null;
 }

/* ===========================
   USER EVENT DATA (DASHBOARD)
   =========================== 
*/
export interface EventData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  birthdayPersonName: string;
  totalGiftAmount: number;
  gifts: Array<{
    name: string;
    link: string | null;
    amount: number;
  }>;
  userUPI: string | null;
  userPhone: string | null;
  userSplitAmount: number;
  paid: boolean;
  paymentTime: string | null;
}