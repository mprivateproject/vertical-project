import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminAuthGuard from '@/components/shared/AdminAuthGuard';

export default function AdminCostDashboard() {
  const { lang } = useLang();

  return (
    <AdminAuthGuard>
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" />
            {lang === 'th' ? 'กลับแดชบอร์ด' : 'Back to Dashboard'}
          </Link>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            💼 {lang === 'th' ? 'SPA Cost Dashboard' : 'SPA Cost Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'th' ? 'บริหารจัดการต้นทุนและกำไรสุทธิ' : 'Manage costs and profitability'}
          </p>
        </div>

        {/* iframe */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-border/60 shadow-sm overflow-hidden"
          style={{ height: '90vh' }}
        >
          <iframe
            src="https://m-project-cost.base44.app"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="SPA Cost Dashboard"
          />
        </motion.div>
      </div>
    </AdminAuthGuard>
  );
}