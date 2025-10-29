"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FoodPollProps } from "@/lib/types/shared.types";


export default function FoodPollCard({
  foodPoll,
  userVote,
  totalVoters,
  onVote,
  disabled = false,
}: FoodPollProps) {
  const sortedFoods = [...foodPoll].sort((a, b) => b.votes.length - a.votes.length);
  const highestVotes = sortedFoods[0]?.votes.length || 0;
  const winners = sortedFoods.filter((f) => f.votes.length === highestVotes);

  const winnerText =
    highestVotes === 0
      ? "No votes"
      : winners.length > 1
        ? `Tie between ${winners.map((w) => w.title).join(" & ")}`
        : `${winners[0].title} won! 🏆`;

  return (
    <Card className="rounded-2xl bg-slate-800 border-slate-700" style={{ boxShadow: "var(--soft-shadow)" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">🍽️ Food Polling</CardTitle>
        <CardDescription className="text-gray-400">
          {disabled ? "Voting is disabled for this event" : "Vote for food to celebrate the birthday"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {foodPoll.map((food) => {
          const votes = food.votes.length;
          const perc = totalVoters === 0 ? 0 : Math.round((votes / totalVoters) * 100);

          return (
            <div key={food.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-white">{food.title}</span>
                <Badge variant="outline" className="rounded-full bg-slate-700 border-slate-600 text-gray-300">
                  {votes} vote
                </Badge>
              </div>

              <Button
                variant={userVote === food.id ? "default" : "outline"}
                className={`w-full rounded-full text-left justify-start disabled:opacity-50 ${
                  userVote === food.id
                    ? "bg-orange-900 text-orange-300 hover:bg-orange-800"
                    : "border-slate-600 bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
                disabled={disabled}
                onClick={() => !disabled && onVote(food.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                    {disabled
                      ? "Voting disabled"
                      : userVote === food.id
                      ? "✅ Your choice"
                      : "Vote for this"}
                  </span>
                  <div className="text-xs text-gray-400">{perc}%</div>
                </div>
              </Button>

              {votes > 0 && (
                <div className="pl-3">
                  <Progress value={perc} className="h-1 mb-1 bg-slate-700" />
                  <div className="text-xs text-gray-400">
                    Voters: {food.votes.map((v) => v.users?.name ?? "Unknown").join(", ")}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {foodPoll.length > 0 && (
          <div className="mt-6 p-3 rounded-lg bg-blue-950 border border-blue-700">
            <p className="text-sm text-center text-gray-300">
              <strong>Current Result :</strong>
            </p>
            <p className="text-sm text-center text-blue-400 font-semibold">{winnerText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
