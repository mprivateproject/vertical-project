import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { Settings, Globe, Bell, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  const { t, lang } = useLang();

  const sections = [
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
    {
      icon: Palette,
      title: lang === 'th' ? 'ธีมและการแสดงผล' : 'Theme & Display',
      desc: lang === 'th' ? 'สี, โลโก้, รูปภาพ' : 'Colors, logo, images',
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">{t('settings')}</h1>
      <div className="space-y-3">
        {sections.map(({ icon: Icon, title, desc }) => (
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
  );
}