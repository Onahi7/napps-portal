import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, QrCode, ShieldCheck, CheckCircle2, RotateCw, Sparkles, Building, User, MapPin } from "lucide-react";
import nappsLogo from "@/assets/napps-logo.png";
import { toast } from "sonner";

export interface MembershipCardData {
  membershipId: string;
  fullName: string;
  schoolName: string;
  schoolAddress?: string;
  lga: string;
  chapter?: string;
  passportPhoto?: string;
  validSession?: string;
  clearingStatus?: string;
}

interface MembershipIdCardProps {
  data: MembershipCardData;
  className?: string;
}

export const MembershipIdCard: React.FC<MembershipIdCardProps> = ({ data, className = "" }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const session = data.validSession || "2025/2026";
  const membershipId = data.membershipId || "NAPPS/NAS/2026/LAF/0142";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://nappsnasarawa.com/verify?id=${encodeURIComponent(membershipId)}`)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("ID Card ready for printing or PVC laminate export.");
    window.print();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white font-bold text-xs uppercase px-2.5 py-0.5">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Membership ID
          </Badge>
          <span className="text-xs text-slate-500 font-medium">Standard CR-80 PVC Format</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-xs h-8 border-slate-300 hover:bg-slate-50"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" />
            Flip to {isFlipped ? "Front" : "Back"}
          </Button>
          <Button 
            size="sm" 
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print ID Card
          </Button>
        </div>
      </div>

      {/* ID Card Container */}
      <div className="flex justify-center">
        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="w-full max-w-[420px] aspect-[1.586/1] rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border-2 border-amber-400/40 select-none">
            {/* Holographic Watermark Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

            <div className="relative h-full flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <img src={nappsLogo} alt="NAPPS Logo" className="w-10 h-10 rounded-full border border-amber-400/60 shadow-xs" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide text-white leading-tight">NAPPS NASARAWA STATE</h3>
                    <p className="text-[9px] font-semibold text-emerald-300 uppercase tracking-wider">Proprietor Identification Card</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    SESSION {session}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-3 gap-3 items-center py-2">
                {/* Photo Column */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-emerald-400/60 shadow-md bg-slate-800 flex items-center justify-center">
                    {data.passportPhoto ? (
                      <img src={data.passportPhoto} alt={data.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[8px] font-mono text-emerald-300 mt-1 uppercase font-bold tracking-wider">
                    CLEARED
                  </span>
                </div>

                {/* Details Column */}
                <div className="col-span-2 space-y-1 text-left pl-1">
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">Proprietor Name</span>
                    <h4 className="font-bold text-sm text-white truncate">{data.fullName}</h4>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">School Institution</span>
                    <p className="font-semibold text-xs text-amber-300 truncate">{data.schoolName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">LGA / Zone</span>
                      <span className="text-[10px] font-medium text-slate-200">{data.lga}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Chapter</span>
                      <span className="text-[10px] font-medium text-slate-200 truncate block">{data.chapter || "Central"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-white/20 pt-2 text-[10px]">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Membership ID</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs tracking-wider">{membershipId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <img src={qrUrl} alt="QR Code" className="w-8 h-8 rounded bg-white p-0.5 border border-white/40" />
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 block">Valid Until</span>
                    <span className="text-[9px] font-bold text-white">31 DEC 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="w-full max-w-[420px] aspect-[1.586/1] rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-slate-900 text-white border-2 border-emerald-500/40 select-none">
            {/* Magnetic Stripe Bar */}
            <div className="h-9 bg-slate-950 -mx-5 -mt-5 mb-4 border-b border-slate-800 flex items-center px-5">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">NAPPS SECURE IDENTIFICATION CHIP DATA</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[11px] font-bold text-emerald-400 uppercase">Terms &amp; Verification Notice</h4>
                  <p className="text-[9px] text-slate-300 leading-tight max-w-[260px]">
                    This card remains the property of NAPPS Nasarawa State Chapter. It certifies that the holder has completed mandatory annual dues and is an accredited member in good standing.
                  </p>
                </div>
                <img src={qrUrl} alt="QR" className="w-14 h-14 rounded-lg bg-white p-1 border border-emerald-400" />
              </div>

              <div className="text-left space-y-1 pt-2 border-t border-slate-800 text-[9px] text-slate-400">
                <div className="flex justify-between">
                  <span>Secretariat Contact:</span>
                  <span className="text-slate-200">+234 803 000 0000</span>
                </div>
                <div className="flex justify-between">
                  <span>Online Verification:</span>
                  <span className="text-emerald-400 font-mono">nappsnasarawa.com/verify</span>
                </div>
                <div className="flex justify-between">
                  <span>If found, please return to:</span>
                  <span className="text-slate-200">Nearest NAPPS LGA Secretariat</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-end border-t border-slate-800">
                <span className="text-[8px] text-slate-500 font-mono">SERIAL: {membershipId.replace(/\//g, '-')}</span>
                <span className="text-[9px] font-serif italic font-bold text-amber-300 underline decoration-amber-400">
                  Alhaji M. A. Tanko (State Chairman)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
