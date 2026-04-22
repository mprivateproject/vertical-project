import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_COSTS = {
  therapistWage: 800,       // ค่าแรงนักบำบัด (บาท/session)
  consumables: 150,         // ค่าน้ำมัน/อุปกรณ์สิ้นเปลือง
  overhead: 300,            // ค่าโสหุ้ย (ค่าไฟ, น้ำ, เช่า แบ่งต่อ session)
  commission: 0,            // ค่าคอมมิชชั่น (%)
};

export default function CostCalculator({ lang, bookings = [], monthRevenue = 0, thisMonthBookings = [] }) {
  const [open, setOpen] = useState(false);
  const [costs, setCosts] = useState(DEFAULT_COSTS);

  const sessionCount = thisMonthBookings.filter(b => b.status !== 'cancelled').length;
  const paidRevenue = monthRevenue;

  const totalTherapist = costs.therapistWage * sessionCount;
  const totalConsumables = costs.consumables * sessionCount;
  const totalOverhead = costs.overhead * sessionCount;
  const totalCommission = (paidRevenue * costs.commission) / 100;
  const totalCost = totalTherapist + totalConsumables + totalOverhead + totalCommission;
  const grossProfit = paidRevenue - totalCost;
  const margin = paidRevenue > 0 ? Math.round((grossProfit / paidRevenue) * 100) : 0;

  const th = lang === 'th';

  const rows = [
    { label: th ? 'ค่าแรงนักบำบัด' : 'Therapist Wage', key: 'therapistWage', unit: th ? 'บาท/session' : 'THB/session', total: totalTherapist },
    { label: th ? 'น้ำมัน/อุปกรณ์' : 'Consumables', key: 'consumables', unit: th ? 'บาท/session' : 'THB/session', total: totalConsumables },
    { label: th ? 'ค่าโสหุ้ย' : 'Overhead', key: 'overhead', unit: th ? 'บาท/session' : 'THB/session', total: totalOverhead },
    { label: th ? 'คอมมิชชั่น' : 'Commission', key: 'commission', unit: '%', total: totalCommission },
  ];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            {th ? '💰 คำนวณต้นทุน (เดือนนี้)' : '💰 Cost Calculator (This Month)'}
          </CardTitle>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-4">
          {/* Session count info */}
          <div className="text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2">
            {th ? `จำนวน session เดือนนี้: ` : 'Sessions this month: '}
            <span className="font-semibold text-foreground">{sessionCount}</span>
            {' · '}
            {th ? 'รายได้: ' : 'Revenue: '}
            <span className="font-semibold text-foreground">฿{paidRevenue.toLocaleString()}</span>
          </div>

          {/* Cost inputs */}
          <div className="space-y-2">
            {rows.map(({ label, key, unit, total }) => (
              <div key={key} className="grid grid-cols-3 items-center gap-3">
                <label className="text-xs text-muted-foreground col-span-1">{label}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={costs[key]}
                    onChange={e => setCosts(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground text-right"
                    min="0"
                  />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{unit}</span>
                </div>
                <div className="text-xs text-right font-medium text-foreground">
                  ฿{Math.round(total).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Summary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{th ? 'ต้นทุนรวม' : 'Total Cost'}</span>
              <span className="font-semibold text-red-500">฿{Math.round(totalCost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{th ? 'รายได้รวม' : 'Total Revenue'}</span>
              <span className="font-semibold text-foreground">฿{paidRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold mt-1 pt-1 border-t border-border">
              <span className={grossProfit >= 0 ? 'text-green-600' : 'text-red-500'}>
                {th ? 'กำไรขั้นต้น' : 'Gross Profit'}
              </span>
              <span className={grossProfit >= 0 ? 'text-green-600' : 'text-red-500'}>
                ฿{Math.round(grossProfit).toLocaleString()}
                <span className="text-xs font-normal ml-1">({margin}%)</span>
              </span>
            </div>
          </div>

          {/* Margin bar */}
          <div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${margin >= 50 ? 'bg-green-500' : margin >= 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.max(0, Math.min(100, margin))}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              {th ? `Margin ${margin}%` : `Margin ${margin}%`}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}