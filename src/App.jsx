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
import { SheetProvider } from '@/lib/SheetContext';
import { ViewModeProvider } from '@/lib/ViewModeContext';

// Customer pages
import Home from '@/pages/customer/Home.jsx';
import Services from '@/pages/customer/Services';
import BookingFlow from '@/pages/customer/BookingFlow';
import BookingHistory from '@/pages/customer/BookingHistory';
import QuickBookingPage from '@/pages/customer/QuickBooking';
import SelfBookingPage from '@/pages/customer/QuickBooking';
import Profile from '@/pages/customer/Profile';

// Staff pages
import StaffDashboard from '@/pages/staff/StaffDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCalendar from '@/pages/admin/AdminCalendar';
import AdminServices from '@/pages/admin/AdminServices';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminCustomerDetail from '@/pages/admin/AdminCustomerDetail';
import AdminReports from '@/pages/admin/AdminReports';
import AdminPromotions from '@/pages/admin/AdminPromotions';
import AdminLoyalty from '@/pages/admin/AdminLoyalty';
import AdminInvitedMembers from '@/pages/admin/AdminInvitedMembers';
import AdminSettings from '@/pages/admin/AdminSettings';
import ScheduleBoard from '@/pages/admin/ScheduleBoard';
import AdminCostDashboard from '@/pages/admin/AdminCostDashboard';
import AdminFeedback from '@/pages/admin/AdminFeedback';
import PrivacyPolicy from '@/pages/customer/PrivacyPolicy';
import Price from '@/pages/customer/Price';
import Preferences from '@/pages/customer/Preferences';
import FeedbackPage from '@/pages/customer/Feedback';

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
        <Route path="/price" element={<Price />} />
        <Route path="/quickbooking" element={<QuickBookingPage />} />
        <Route path="/selfbooking" element={<SelfBookingPage />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Route>

      {/* Staff routes */}
      <Route path="/staff" element={<StaffDashboard />} />

      {/* Admin routes with sidebar */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/customers/:customerId" element={<AdminCustomerDetail />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/promotions" element={<AdminPromotions />} />
        <Route path="/admin/loyalty" element={<AdminLoyalty />} />
        <Route path="/admin/invited-members" element={<AdminInvitedMembers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/schedule" element={<ScheduleBoard />} />
        <Route path="/admin/cost-dashboard" element={<AdminCostDashboard />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
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
              <ViewModeProvider>
              <SheetProvider>
              <Router>
                <AuthenticatedApp />
              </Router>
              <Toaster />
              </SheetProvider>
              </ViewModeProvider>
            </LineProvider>
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App