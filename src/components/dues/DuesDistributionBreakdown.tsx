import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Landmark, Compass, Flag, ShieldCheck, CheckCircle2, Split } from "lucide-react";

interface DuesDistributionBreakdownProps {
  totalAmount?: number;
  className?: string;
  showDetails?: boolean;
}

export const DuesDistributionBreakdown: React.FC<DuesDistributionBreakdownProps> = ({
  totalAmount = 14500,
  className = "",
  showDetails = true,
}) => {
  const tiers = [
    {
      level: "Local Chapter",
      pct: 20,
      amount: Math.round(totalAmount * 0.20),
      icon: Building,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      progressColor: "bg-emerald-500",
      description: "Allocated directly to the LGA Chapter Executive for grassroots meetings and local programs.",
    },
    {
      level: "State Chapter",
      pct: 35,
      amount: Math.round(totalAmount * 0.35),
      icon: Landmark,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      progressColor: "bg-blue-500",
      description: "State secretariat administration, ministry policy advocacy, and quality control enforcement.",
    },
    {
      level: "North Central Zone",
      pct: 20,
      amount: Math.round(totalAmount * 0.20),
      icon: Compass,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      progressColor: "bg-purple-500",
      description: "Regional zonal secretariat activities, interstate conferences, and dispute resolution.",
    },
    {
      level: "National Secretariat",
      pct: 25,
      amount: Math.round(totalAmount * 0.25),
      icon: Flag,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      progressColor: "bg-amber-500",
      description: "National executive council, national constitution updates, and nationwide unified policy representation.",
    },
  ];

  return (
    <Card className={`border-slate-200 shadow-sm overflow-hidden bg-white ${className}`}>
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                Automated 4-Tier Dues Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Single unified payment is automatically remitted to the 4 levels of the Association
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Constitutional Split Ratio
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Progress Bar Visualizing Split */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Distribution Breakdown (Total: ₦{totalAmount.toLocaleString()})</span>
            <span>100% Automated Remittance</span>
          </div>
          <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className={`${t.progressColor} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                style={{ width: `${t.pct}%` }}
                title={`${t.level}: ${t.pct}% (₦${t.amount.toLocaleString()})`}
              />
            ))}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{tier.level}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 ${tier.badgeColor}`}>
                    {tier.pct}%
                  </Badge>
                </div>

                <div className="pt-1">
                  <div className="text-lg font-extrabold text-slate-900">
                    ₦{tier.amount.toLocaleString()}
                  </div>
                  {showDetails && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                      {tier.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Real-time digital audit ledger generated automatically on payment verification. No manual remittance queues required.</span>
        </div>
      </CardContent>
    </Card>
  );
};
