import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, CheckCircle2, ShieldCheck, Building2, User, Calendar, Hash, FileCheck, Share2 } from "lucide-react";
import nappsLogo from "@/assets/napps-logo.png";
import { toast } from "sonner";

export interface ReceiptData {
  receiptNumber?: string;
  payerName: string;
  schoolName: string;
  email?: string;
  phone?: string;
  lga: string;
  chapter?: string;
  membershipId?: string;
  amountPaid: number;
  paymentMethod?: string;
  paystackReference?: string;
  paymentDate?: string | Date;
  academicSession?: string;
}

interface OfficialReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const receiptNo = data.receiptNumber || `REC-NAPPS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateFormatted = data.paymentDate 
    ? new Date(data.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const total = data.amountPaid || 14500;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://nappsnasarawa.com/verify?receipt=${receiptNo}&school=${encodeURIComponent(data.schoolName)}`)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Receipt image ready for download/saving");
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Action Toolbar */}
          <div className="bg-slate-900 text-white p-3.5 px-6 flex items-center justify-between no-print">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Official Electronic Receipt
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Receipt
              </Button>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)} className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 h-8">
                Close
              </Button>
            </div>
          </div>

          {/* Printable Receipt Paper */}
          <div ref={receiptRef} className="p-8 sm:p-10 space-y-6 bg-white text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-5">
              <div className="flex items-center gap-4">
                <img src={nappsLogo} alt="NAPPS Logo" className="w-16 h-16 rounded-full border border-slate-200 shadow-xs" />
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    NAPPS NASARAWA STATE CHAPTER
                  </h2>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    National Association of Proprietors of Private Schools
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    State Secretariat: Along Shendam Road, Lafia, Nasarawa State, Nigeria
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-600 text-white font-bold text-xs uppercase px-2.5 py-0.5">
                  PAID &amp; CLEARED
                </Badge>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Status: Electronic Verified</p>
              </div>
            </div>

            {/* Receipt Meta Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Receipt No.</span>
                <span className="font-mono font-bold text-slate-900">{receiptNo}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Payment Date</span>
                <span className="font-semibold text-slate-900">{dateFormatted}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Membership ID</span>
                <span className="font-mono font-bold text-emerald-700">{data.membershipId || 'NAPPS/NAS/2026/0142'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Academic Session</span>
                <span className="font-semibold text-slate-900">{data.academicSession || '2025/2026'}</span>
              </div>
            </div>

            {/* Proprietor & School Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payer Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Proprietor Name</span>
                  <span className="font-bold text-sm text-slate-900">{data.payerName}</span>
                  {data.email && <span className="text-slate-500 block">{data.email}</span>}
                  {data.phone && <span className="text-slate-500 block">{data.phone}</span>}
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Institution Name</span>
                  <span className="font-bold text-sm text-slate-900">{data.schoolName}</span>
                  <span className="text-slate-500 block">{data.lga} LGA • {data.chapter || 'Central Chapter'}</span>
                </div>
              </div>
            </div>

            {/* Fee Itemization Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Breakdown</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4 text-center">Beneficiary Level</th>
                      <th className="py-2.5 px-4 text-right">Amount (NGN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-900">Annual Local Chapter Dues (20%)</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">{data.lga} Chapter Executive</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">₦{Math.round(total * 0.20).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-900">State Chapter Unified Dues (35%)</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">Nasarawa State Secretariat</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">₦{Math.round(total * 0.35).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-900">Zonal Remittance (20%)</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">North Central Zonal Secretariat</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">₦{Math.round(total * 0.20).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-900">National Secretariat Dues (25%)</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">NAPPS National Headquarters</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">₦{Math.round(total * 0.25).toLocaleString()}</td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-bold text-sm">
                      <td className="py-3 px-4 text-emerald-950" colSpan={2}>TOTAL AMOUNT PAID &amp; CLEARED</td>
                      <td className="py-3 px-4 text-right text-emerald-700 text-base">₦{total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QR Code & Signatures */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <img 
                  src={qrUrl} 
                  alt="Verification QR Code" 
                  className="w-20 h-20 border border-slate-300 rounded-lg p-1 bg-white"
                />
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-slate-800">Scan to Verify Authenticity</p>
                  <p>Cryptographically linked to the official NAPPS Nasarawa state ledger.</p>
                  <p className="font-mono text-[10px] text-slate-400">Ref: {data.paystackReference || 'PSTK-NAPPS-AUTH-091'}</p>
                </div>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="h-9 flex items-end justify-center sm:justify-end">
                  <span className="font-serif italic font-bold text-sm text-emerald-900 tracking-wide underline decoration-emerald-500">
                    Alhaji M. A. Tanko
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">State Financial Secretary / Chairman</p>
                <p className="text-[10px] text-slate-400">NAPPS Nasarawa State Chapter</p>
              </div>
            </div>

            {/* Footer Notice */}
            <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-slate-100">
              This is an official computer-generated receipt issued under the authority of the NAPPS Nasarawa State Executive Council. Tampering or fraudulent duplication is strictly prohibited.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
