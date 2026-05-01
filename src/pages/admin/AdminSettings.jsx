import React, { useEffect, useState } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { Settings, Globe, Bell, Shield, Palette, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

const VIEW_OPTIONS = [
  { value: 'mobile', icon: Smartphone, labelTh: 'มือถือ', labelEn: 'Mobile' },
  { value: 'tablet', icon: Tablet, labelTh: 'แท็บเล็ต', labelEn: 'Tablet' },
  { value: 'desktop', icon: Monitor, labelTh: 'คอมพิวเตอร์', labelEn: 'Desktop' },
];

export default function AdminSettings() {
  const { t, lang } = useLang();
  const [defaultView, setDefaultView] = useState('mobile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.AppSetting.filter({ key: 'default_view_mode' })
      .then(results => {
        if (results.length > 0) setDefaultView(results[0].value);
      })
      .catch(() => {});
  }, []);

  const handleViewChange = async (mode) => {
    setSaving(true);
    setSaved(false);
    setDefaultView(mode);
    try {
      const existing = await base44.entities.AppSetting.filter({ key: 'default_view_mode' });
      if (existing.length > 0) {
        await base44.entities.AppSetting.update(existing[0].id, { value: mode });
      } else {
        await base44.entities.AppSetting.create({
          key: 'default_view_mode',
          value: mode,
          description: 'Default layout view for customers',
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const infoSections = [
    {
      icon: Globe,
      title: lang === 'th' ? 'การตั้งค่าทั่วไป' : 'General Settings',
      desc: lang === 'th' ? 'ชื่อร้าน, เวลาเปิด-ปิด, ที่อยู่' : 'Spa name, hours, address',
    },
    {
      icon: Bell,
      title: lang === 'th' ? 'การแจ้งเตือน LINE' : 'LINE Notifications',
      desc: lang === 'th' ? 'ตั้งค่า LINE Messaging API' : 'Configure LINE Messaging API',
    },
    {
      icon: Shield,
      title: lang === 'th' ? 'การชำระเงิน' : 'Payment Settings',
      desc: lang === 'th' ? 'PromptPay, บัญชีธนาคาร, บัตรเครดิต' : 'PromptPay, bank, cards',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">{t('settings')}</h1>

      {/* ── Customer View Mode ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {lang === 'th' ? 'การแสดงผลเริ่มต้นสำหรับลูกค้า' : 'Default Customer View'}
        </h2>
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary">
                <Palette className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {lang === 'th' ? 'โหมดการแสดงผล' : 'Layout Mode'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === 'th'
                    ? 'กำหนดว่าลูกค้าจะเห็นหน้าเว็บแบบไหนเมื่อเปิดแอปครั้งแรก'
                    : 'Sets the default layout when customers first open the app'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {VIEW_OPTIONS.map(({ value, icon: Icon, labelTh, labelEn }) => {
                const isSelected = defaultView === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleViewChange(value)}
                    disabled={saving}
                    className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all"
                    style={{
                      background: isSelected ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--muted))',
                      borderColor: isSelected ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))',
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                    >
                      {lang === 'th' ? labelTh : labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {saved && (
              <p className="text-xs text-center" style={{ color: 'hsl(var(--primary))' }}>
                {lang === 'th' ? '✓ บันทึกแล้ว' : '✓ Saved'}
              </p>
            )}
            {saving && (
              <p className="text-xs text-center text-muted-foreground">
                {lang === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Other Settings (placeholder) ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {lang === 'th' ? 'การตั้งค่าอื่นๆ' : 'Other Settings'}
        </h2>
        <div className="space-y-3">
          {infoSections.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-secondary">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}