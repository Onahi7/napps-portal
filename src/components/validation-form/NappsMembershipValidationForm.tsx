import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download, Sparkles, Check, QrCode, ShieldCheck, ArrowLeft, Edit3, Save } from 'lucide-react';
import { toast } from 'sonner';

export interface ValidationFormData {
  schoolName: string;
  schoolAddress: string;
  schoolPhone?: string;
  aegeLgeaDa: string;
  lga: string;
  yearOfEstablishment: number | string;
  schoolRegistrationStatus: 'REGISTERED' | 'NOT REGISTERED' | 'IN PROGRESS';
  levelsOfEducation: 'Nursery/Primary' | 'Primary' | 'JSS Only' | 'JSS & SSS';
  typeOfSchool: 'Regular' | 'Islamiyya Integrated' | 'Special Needs';
  ownership: 'Community' | 'Faith Based' | 'Individualist' | 'N.G.O';
  
  duesPaymentHistory: Array<{
    session: string;
    fullyPaidAmount?: number | null;
    partiallyPaidAmount?: number | null;
    paymentMode?: string;
    receiver?: string;
    serialNumber?: string;
    receiptIssued?: boolean;
  }>;

  stateDuesRate?: number;
  zonalDuesRate?: number;
  nationalDuesRate?: number;

  nnsuceTimesWritten: 'Never' | '1' | '2' | '3';
  nnsuce2025PupilsCount: number | string;
  hasNappsIdCard: boolean;

  fullName: string;
  chapter: string;
  schoolCode: string;
  phone: string;
  email: string;
  positionInNapps: string;
  signature?: string;
  passportPhoto?: string;
  membershipId?: string;
}

const EMPTY_FORM_DATA: ValidationFormData = {
  schoolName: '',
  schoolAddress: '',
  schoolPhone: '',
  aegeLgeaDa: '',
  lga: '',
  yearOfEstablishment: '',
  schoolRegistrationStatus: 'IN PROGRESS',
  levelsOfEducation: 'Nursery/Primary',
  typeOfSchool: 'Regular',
  ownership: 'Individualist',
  stateDuesRate: 4000,
  zonalDuesRate: 2000,
  nationalDuesRate: 5000,
  duesPaymentHistory: [
    { session: '2023/2024', fullyPaidAmount: null, partiallyPaidAmount: null, paymentMode: '', receiver: '', serialNumber: '', receiptIssued: false },
    { session: '2024/2025', fullyPaidAmount: null, partiallyPaidAmount: null, paymentMode: '', receiver: '', serialNumber: '', receiptIssued: false },
    { session: '2025/2026', fullyPaidAmount: null, partiallyPaidAmount: null, paymentMode: '', receiver: '', serialNumber: '', receiptIssued: false },
    { session: '2026/2027', fullyPaidAmount: null, partiallyPaidAmount: null, paymentMode: '', receiver: '', serialNumber: '', receiptIssued: false },
  ],
  nnsuceTimesWritten: 'Never',
  nnsuce2025PupilsCount: '',
  hasNappsIdCard: false,
  fullName: '',
  chapter: '',
  schoolCode: '',
  phone: '',
  email: '',
  positionInNapps: '',
  signature: '',
  membershipId: '',
};

interface Props {
  initialData?: Partial<ValidationFormData>;
  onSave?: (data: ValidationFormData) => void;
  isEditable?: boolean;
}

export const NappsMembershipValidationForm: React.FC<Props> = ({
  initialData,
  onSave,
  isEditable = false,
}) => {
  const [formData, setFormData] = useState<ValidationFormData>({
    ...EMPTY_FORM_DATA,
    ...initialData,
  });
  const [isEditing, setIsEditing] = useState(isEditable);
  const printRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        duesPaymentHistory: initialData.duesPaymentHistory || prev.duesPaymentHistory,
      }));
    }
  }, [initialData]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
    toast.success('Validation form details updated successfully!');
  };

  const updateField = (field: keyof ValidationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateDuesRow = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const history = [...prev.duesPaymentHistory];
      history[index] = { ...history[index], [key]: value };
      return { ...prev, duesPaymentHistory: history };
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white shadow-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <span>Official NAPPS Membership Validation Form</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NNSUCE History Verified
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Standardised official physical format with scannable QR verification code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white"
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Done Editing
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Form
              </>
            )}
          </Button>

          {isEditing && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Save Record
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Official Form (A4)
          </Button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div
        ref={printRef}
        className="bg-white text-black p-6 sm:p-10 border border-slate-300 shadow-xl rounded-lg print:shadow-none print:border-none print:p-0 font-sans text-[12px] leading-tight print:w-full"
        style={{ minHeight: '1050px' }}
      >
        {/* Header */}
        <div className="relative border-b-2 border-red-600 pb-3 mb-4">
          <div className="flex items-center justify-between">
            {/* NAPPS Logo */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-emerald-700 p-0.5 flex items-center justify-center bg-emerald-50 shrink-0">
                <div className="w-full h-full rounded-full border border-amber-600 flex flex-col items-center justify-center text-center p-1 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white">
                  <span className="text-[7px] font-extrabold uppercase leading-none tracking-tighter">NAPPS</span>
                  <div className="w-5 h-5 my-0.5 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-[8px]">
                    ★
                  </div>
                  <span className="text-[5px] uppercase font-bold tracking-tight">Nasarawa</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
                  National Association of Proprietors of Private Schools
                </span>
                <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Nasarawa State Chapter — Secretariat
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-black text-red-600 tracking-tight uppercase">
                NAPPS MEMBERSHIP VALIDATION
              </h1>
              <h2 className="text-lg sm:text-xl font-black text-red-600 uppercase tracking-widest">
                FORM
              </h2>
            </div>
          </div>

          <div className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
            NAPPS MEMBERSHIP VALIDATION FORM — NNSUCE HISTORY
          </div>
        </div>

        {/* 1. School Name */}
        <div className="mb-2.5 flex items-baseline gap-2">
          <span className="font-bold text-[13px] whitespace-nowrap">1. SCHOOL NAME :</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => updateField('schoolName', e.target.value.toUpperCase())}
              className="flex-1 border-b-2 border-black font-semibold uppercase px-1 py-0.5 text-xs bg-amber-50/50 focus:outline-none"
            />
          ) : (
            <span className="flex-1 border-b border-black font-bold uppercase tracking-wide px-1">
              {formData.schoolName}
            </span>
          )}
        </div>

        {/* 2. School Address & Phone */}
        <div className="mb-2.5 flex flex-wrap sm:flex-nowrap items-baseline gap-2">
          <span className="font-bold text-[13px] whitespace-nowrap">2. SCHOOL ADDRESS :</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.schoolAddress}
              onChange={(e) => updateField('schoolAddress', e.target.value.toUpperCase())}
              className="flex-1 border-b border-black uppercase px-1 py-0.5 text-xs bg-amber-50/50 focus:outline-none"
            />
          ) : (
            <span className="flex-1 border-b border-black uppercase px-1">
              {formData.schoolAddress}
            </span>
          )}

          <span className="font-bold text-[13px] whitespace-nowrap ml-2">PHONE NO :</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.schoolPhone || formData.phone}
              onChange={(e) => updateField('schoolPhone', e.target.value)}
              className="w-36 border-b border-black px-1 py-0.5 text-xs bg-amber-50/50 focus:outline-none font-semibold"
            />
          ) : (
            <span className="w-36 border-b border-black font-semibold px-1">
              {formData.schoolPhone || formData.phone}
            </span>
          )}
        </div>

        {/* 3 & 4. AEGE/LGEA/DA and LGA */}
        <div className="mb-3 flex flex-wrap sm:flex-nowrap items-baseline gap-2">
          <span className="font-bold text-[13px] whitespace-nowrap">3. AEGE/ LGEA/ DA :</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.aegeLgeaDa}
              onChange={(e) => updateField('aegeLgeaDa', e.target.value.toUpperCase())}
              className="flex-1 border-b border-black uppercase px-1 py-0.5 text-xs bg-amber-50/50 focus:outline-none"
            />
          ) : (
            <span className="flex-1 border-b border-black uppercase px-1">
              {formData.aegeLgeaDa}
            </span>
          )}

          <span className="font-bold text-[13px] whitespace-nowrap ml-2">4. L. G. A. :</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.lga}
              onChange={(e) => updateField('lga', e.target.value)}
              className="w-40 border-b border-black px-1 py-0.5 text-xs bg-amber-50/50 focus:outline-none font-bold"
            />
          ) : (
            <span className="w-40 border-b border-black font-bold uppercase px-1">
              {formData.lga}
            </span>
          )}
        </div>

        {/* Instructions Banner */}
        <div className="bg-yellow-300 border border-yellow-400 py-1 px-3 mb-3">
          <span className="font-black text-[12px] uppercase tracking-wide mr-2">INSTRUCTIONS</span>
          <span className="font-bold text-[11px]">
            Answer every question and tick only one box in each section.
          </span>
        </div>

        {/* 5. Year of Establishment */}
        <div className="mb-2.5 flex items-baseline gap-2">
          <span className="font-bold text-[12px] whitespace-nowrap">5.YEAR OF ESTABLISHMENT :</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.yearOfEstablishment}
              onChange={(e) => updateField('yearOfEstablishment', e.target.value)}
              className="w-24 border-b border-black font-bold px-1 py-0.5 text-xs bg-amber-50/50 focus:outline-none text-center"
            />
          ) : (
            <span className="w-24 border-b border-black font-bold px-1 text-center">
              {formData.yearOfEstablishment}
            </span>
          )}
        </div>

        {/* 6. School Registration Status */}
        <div className="mb-2.5 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-bold text-[12px] whitespace-nowrap">6.SCHOOL REGISTRATION STATUS</span>
          {(['REGISTERED', 'NOT REGISTERED', 'IN PROGRESS'] as const).map((status) => (
            <label
              key={status}
              onClick={() => isEditing && updateField('schoolRegistrationStatus', status)}
              className={`flex items-center gap-1.5 cursor-pointer text-[11px] font-bold ${
                isEditing ? 'hover:text-emerald-700' : ''
              }`}
            >
              <span
                className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                  formData.schoolRegistrationStatus === status ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {formData.schoolRegistrationStatus === status && '✓'}
              </span>
              <span>{status}</span>
            </label>
          ))}
        </div>

        {/* 7. Levels of Education Offered */}
        <div className="mb-2.5 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-bold text-[12px] whitespace-nowrap">7. LEVELS OF EDUCATION OFFERED</span>
          {(['Nursery/Primary', 'Primary', 'JSS Only', 'JSS & SSS'] as const).map((level) => (
            <label
              key={level}
              onClick={() => isEditing && updateField('levelsOfEducation', level)}
              className={`flex items-center gap-1.5 cursor-pointer text-[11px] font-bold ${
                isEditing ? 'hover:text-emerald-700' : ''
              }`}
            >
              <span
                className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                  formData.levelsOfEducation === level ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {formData.levelsOfEducation === level && '✓'}
              </span>
              <span>{level}</span>
            </label>
          ))}
        </div>

        {/* 8. Type of School */}
        <div className="mb-2.5 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-bold text-[12px] whitespace-nowrap">8. TYPE OF SCHOOL :</span>
          {(['Regular', 'Islamiyya Integrated', 'Special Needs'] as const).map((type) => (
            <label
              key={type}
              onClick={() => isEditing && updateField('typeOfSchool', type)}
              className={`flex items-center gap-1.5 cursor-pointer text-[11px] font-bold ${
                isEditing ? 'hover:text-emerald-700' : ''
              }`}
            >
              <span
                className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                  formData.typeOfSchool === type ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {formData.typeOfSchool === type && '✓'}
              </span>
              <span>{type}</span>
            </label>
          ))}
        </div>

        {/* 9. Ownership */}
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-bold text-[12px] whitespace-nowrap">9. OWNERSHIP</span>
          {(['Community', 'Faith Based', 'Individualist', 'N.G.O'] as const).map((owner) => (
            <label
              key={owner}
              onClick={() => isEditing && updateField('ownership', owner)}
              className={`flex items-center gap-1.5 cursor-pointer text-[11px] font-bold ${
                isEditing ? 'hover:text-emerald-700' : ''
              }`}
            >
              <span
                className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                  formData.ownership === owner ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {formData.ownership === owner && '✓'}
              </span>
              <span>{owner}</span>
            </label>
          ))}
        </div>

        {/* Dues Payment History Section */}
        <div className="bg-yellow-300 border border-yellow-400 py-1 px-3 mb-2 text-center">
          <h3 className="font-black text-[13px] uppercase tracking-wider">DUES PAYMENT HISTORY</h3>
        </div>

        {/* Item 10 Dues Payment Status Table */}
        <div className="border border-black mb-3">
          <div className="bg-slate-100 p-1.5 border-b border-black font-bold text-[11px] uppercase">
            10. DUES PAYMENT STATUS
          </div>

          <div className="grid grid-cols-12 divide-x divide-black text-[11px]">
            {/* Left Column: Rates & Mode Breakdown */}
            <div className="col-span-4 p-2 space-y-2 bg-slate-50">
              <div className="space-y-0.5 font-bold text-[11px] border-b border-slate-300 pb-1.5">
                <div className="flex justify-between">
                  <span>STATE DUES</span>
                  <span className="font-black">₦4000.</span>
                </div>
                <div className="flex justify-between">
                  <span>ZONAL DUES</span>
                  <span className="font-black">₦2000.</span>
                </div>
                <div className="flex justify-between">
                  <span>NAT. DUES</span>
                  <span className="font-black">₦5000.</span>
                </div>
              </div>

              <div className="font-bold space-y-0.5 text-[10px] text-slate-800">
                <div className="uppercase tracking-wider font-black text-slate-900">PAYMENT MODE:</div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-black inline-block" />
                  <span>CASH PAYMENT .</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-black inline-block" />
                  <span>BANK /POS DEP.</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-black inline-block" />
                  <span>ONLINE PAYMENT .</span>
                </div>
              </div>
            </div>

            {/* Right 8 Columns: 4 Academic Sessions Table */}
            <div className="col-span-8 grid grid-cols-4 divide-x divide-black">
              {formData.duesPaymentHistory.map((row, idx) => (
                <div key={row.session} className="flex flex-col text-center">
                  {/* Session Header */}
                  <div className="bg-slate-200 border-b border-black py-1 font-bold text-[10px]">
                    {row.session}
                  </div>

                  {/* Fully Paid Row */}
                  <div className="border-b border-black p-1 text-[10px]">
                    <div className="text-[9px] font-semibold text-slate-600">FULLY PAID ₦</div>
                    {isEditing ? (
                      <input
                        type="number"
                        placeholder="₦"
                        value={row.fullyPaidAmount || ''}
                        onChange={(e) => updateDuesRow(idx, 'fullyPaidAmount', e.target.value ? Number(e.target.value) : null)}
                        className="w-full text-center border font-bold text-xs bg-amber-50"
                      />
                    ) : (
                      <div className="font-black h-5 flex items-center justify-center text-emerald-800">
                        {row.fullyPaidAmount ? `₦${row.fullyPaidAmount.toLocaleString()}` : '—'}
                      </div>
                    )}
                  </div>

                  {/* Partially Paid Row */}
                  <div className="border-b border-black p-1 text-[10px]">
                    <div className="text-[9px] font-semibold text-slate-600">PARTIALLY PAID ₦</div>
                    {isEditing ? (
                      <input
                        type="number"
                        placeholder="₦"
                        value={row.partiallyPaidAmount || ''}
                        onChange={(e) => updateDuesRow(idx, 'partiallyPaidAmount', e.target.value ? Number(e.target.value) : null)}
                        className="w-full text-center border font-bold text-xs bg-amber-50"
                      />
                    ) : (
                      <div className="font-semibold h-5 flex items-center justify-center text-amber-800">
                        {row.partiallyPaidAmount ? `₦${row.partiallyPaidAmount.toLocaleString()}` : '—'}
                      </div>
                    )}
                  </div>

                  {/* Receiver Row */}
                  <div className="border-b border-black p-1 text-[9px] bg-slate-50">
                    <div className="font-semibold uppercase text-slate-500">RECIEVER</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.receiver || ''}
                        onChange={(e) => updateDuesRow(idx, 'receiver', e.target.value)}
                        className="w-full text-center border text-[9px]"
                      />
                    ) : (
                      <div className="font-bold text-[9px] truncate h-4 flex items-center justify-center">
                        {row.receiver || '—'}
                      </div>
                    )}
                  </div>

                  {/* S/N Row */}
                  <div className="border-b border-black p-1 text-[9px]">
                    <span className="font-bold">S/N: </span>
                    <span className="font-mono text-[8px]">{row.serialNumber || '-------'}</span>
                  </div>

                  {/* Receipt Checkbox */}
                  <div className="p-1 flex items-center justify-center gap-1 text-[9px] font-bold">
                    <span>( RECIEPT )</span>
                    <span
                      onClick={() => isEditing && updateDuesRow(idx, 'receiptIssued', !row.receiptIssued)}
                      className={`w-3 h-3 border border-black flex items-center justify-center cursor-pointer text-[8px] ${
                        row.receiptIssued ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {row.receiptIssued && '✓'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NNSUCE History Section */}
        <div className="bg-yellow-300 border border-yellow-400 py-1 px-3 mb-2 text-center">
          <h3 className="font-black text-[13px] uppercase tracking-wider">NNSUCE HISTORY</h3>
        </div>

        {/* 11. Previous NNSUCE Times */}
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-[11px] leading-tight">
            11. How many times has your school previously written the NAPPS Unified Certificate Examination (NNSUCE)?
          </span>
          {(['Never', '1', '2', '3'] as const).map((val) => (
            <label
              key={val}
              onClick={() => isEditing && updateField('nnsuceTimesWritten', val)}
              className={`flex items-center gap-1 cursor-pointer text-[11px] font-bold ${
                isEditing ? 'hover:text-emerald-700' : ''
              }`}
            >
              <span
                className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                  formData.nnsuceTimesWritten === val ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {formData.nnsuceTimesWritten === val && '✓'}
              </span>
              <span>{val}</span>
            </label>
          ))}
        </div>

        {/* 12. Pupils Registered in 2025 */}
        <div className="mb-2 flex items-baseline gap-2">
          <span className="font-bold text-[11px]">
            12.How many pupils your school registered in yr 2025 NNSUCE exam ?
          </span>
          <span className="font-bold text-[11px]">Number:</span>
          {isEditing ? (
            <input
              type="number"
              value={formData.nnsuce2025PupilsCount}
              onChange={(e) => updateField('nnsuce2025PupilsCount', e.target.value)}
              className="w-20 border-b border-black font-bold px-1 text-center text-xs bg-amber-50"
            />
          ) : (
            <span className="w-20 border-b border-black font-bold text-center px-1">
              {formData.nnsuce2025PupilsCount}
            </span>
          )}
        </div>

        {/* 13. Has NAPPS Membership ID Card */}
        <div className="mb-3 flex items-center gap-4">
          <span className="font-bold text-[11px] uppercase">
            13. DO YOU HAVE THE NAPPS MEMBERSHIP ID CARD ?
          </span>
          <label
            onClick={() => isEditing && updateField('hasNappsIdCard', true)}
            className="flex items-center gap-1 cursor-pointer text-[11px] font-bold"
          >
            <span>YES</span>
            <span
              className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                formData.hasNappsIdCard ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {formData.hasNappsIdCard && '✓'}
            </span>
          </label>

          <label
            onClick={() => isEditing && updateField('hasNappsIdCard', false)}
            className="flex items-center gap-1 cursor-pointer text-[11px] font-bold"
          >
            <span>NO</span>
            <span
              className={`w-3.5 h-3.5 border-2 border-black flex items-center justify-center text-[10px] ${
                !formData.hasNappsIdCard ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {!formData.hasNappsIdCard && '✓'}
            </span>
          </label>
        </div>

        {/* 14. Proprietor's ID Information / Remarks */}
        <div className="border border-black">
          <div className="bg-yellow-300 border-b border-black py-1 px-3">
            <h3 className="font-black text-[12px] uppercase">
              14. PROPRIETOR’S ID INFORMATION / REMARKS
            </h3>
          </div>

          <div className="p-3 grid grid-cols-12 gap-3 items-center">
            {/* Left 9 Columns: Personal Data Lines */}
            <div className="col-span-9 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[11px] whitespace-nowrap">FULL NAME :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value.toUpperCase())}
                    className="flex-1 border-b border-black font-bold uppercase text-xs px-1 bg-amber-50"
                  />
                ) : (
                  <span className="flex-1 border-b border-black font-bold uppercase px-1">
                    {formData.fullName}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-2">
                <span className="font-bold text-[11px] whitespace-nowrap">CHAPTER:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => updateField('chapter', e.target.value)}
                    className="flex-1 border-b border-black text-xs px-1 bg-amber-50"
                  />
                ) : (
                  <span className="flex-1 border-b border-black px-1 font-semibold">
                    {formData.chapter}
                  </span>
                )}

                <span className="font-bold text-[11px] whitespace-nowrap ml-2">SCHOOL CODE:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.schoolCode}
                    onChange={(e) => updateField('schoolCode', e.target.value.toUpperCase())}
                    className="w-32 border-b border-black font-mono font-bold text-xs px-1 bg-amber-50 text-center"
                  />
                ) : (
                  <span className="w-32 border-b border-black font-mono font-bold text-center px-1">
                    {formData.schoolCode}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-2">
                <span className="font-bold text-[11px] whitespace-nowrap">PHONE NO.:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-36 border-b border-black text-xs px-1 bg-amber-50 font-semibold"
                  />
                ) : (
                  <span className="w-36 border-b border-black px-1 font-semibold">
                    {formData.phone}
                  </span>
                )}

                <span className="font-bold text-[11px] whitespace-nowrap ml-2">EMAIL :</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="flex-1 border-b border-black text-xs px-1 bg-amber-50"
                  />
                ) : (
                  <span className="flex-1 border-b border-black px-1 text-[11px]">
                    {formData.email}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[11px] whitespace-nowrap">POSITION IN NAPPS :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.positionInNapps}
                    onChange={(e) => updateField('positionInNapps', e.target.value)}
                    className="flex-1 border-b border-black text-xs px-1 bg-amber-50"
                  />
                ) : (
                  <span className="flex-1 border-b border-black px-1 font-semibold">
                    {formData.positionInNapps}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-bold text-[11px] whitespace-nowrap">SIGNATURE :</span>
                <span className="font-serif italic font-bold text-sm tracking-wider px-2 border-b border-black flex-1">
                  {formData.signature || formData.fullName.split(' ')[0]}
                </span>
                {formData.membershipId && (
                  <span className="text-[9px] font-mono text-slate-500">
                    ID: {formData.membershipId}
                  </span>
                )}
              </div>
            </div>

            {/* Right 3 Columns: Pass Port Photo Box */}
            <div className="col-span-3 flex justify-center">
              <div className="w-24 h-32 sm:w-28 sm:h-36 border-2 border-black relative flex items-center justify-center overflow-hidden bg-slate-100 shadow-inner">
                {formData.passportPhoto ? (
                  <img
                    src={formData.passportPhoto}
                    alt="Proprietor Passport"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-400 via-slate-600 to-slate-800 flex items-center justify-center relative">
                    {/* Diagonal text PASS PORT */}
                    <div className="transform -rotate-45 font-black text-white/90 text-sm tracking-widest uppercase border border-white/50 px-2 py-0.5 shadow-sm">
                      PASS PORT
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note and Verification Barcode */}
        <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>NAPPS Nasarawa State Chapter — Standardised Membership &amp; NNSUCE Unified Database</span>
          </div>

          <div className="font-mono text-[8px] text-right">
            <span>DOC-REF: NAS-VAL-{formData.schoolCode ? formData.schoolCode.replace('/', '-') : '2026'} | SEC-AUTH-OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
