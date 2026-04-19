<LineProvider>
  <Router />
</LineProvider>

import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LineProvider } from '@/lib/LineContext';

// Customer pages
import Home from '@/pages/customer/Home.jsx';
import Services from '@/pages/customer/Services';
import BookingFlow from '@/pages/customer/BookingFlow';
import BookingHistory from '@/pages/customer/BookingHistory';
import QuickBookingPage from '@/pages/customer/QuickBooking';
import Profile from '@/pages/customer/Profile';

// Staff pages
import StaffDashboard from '@/pages/staff/StaffDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCalendar from '@/pages/admin/AdminCalendar';
import AdminServices from '@/pages/admin/AdminServices';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminReports from '@/pages/admin/AdminReports';
import AdminPromotions from '@/pages/admin/AdminPromotions';
import AdminSettings from '@/pages/admin/AdminSettings';
import ScheduleBoard from '@/pages/admin/ScheduleBoard';
import PrivacyPolicy from '@/pages/customer/PrivacyPolicy';

// Layouts
import CustomerLayout from '@/components/shared/CustomerLayout';
import AdminLayout from '@/components/shared/AdminLayout';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Customer routes with bottom nav */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<BookingFlow />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/quickbooking" element={<QuickBookingPage />} />
      </Route>

      {/* Staff routes */}
      <Route path="/staff" element={<StaffDashboard />} />

      {/* Admin routes with sidebar */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/promotions" element={<AdminPromotions />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/schedule" element={<ScheduleBoard />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
          <ThemeProvider>
            <LineProvider>
              <Router>
                <AuthenticatedApp />
              </Router>
              <Toaster />
            </LineProvider>
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App