import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LineProvider } from '@/lib/LineContext';

// Customer pages
import Home from '@/pages/customer/Home';
import Services from '@/pages/customer/Services';
import BookingFlow from '@/pages/customer/BookingFlow';
import BookingHistory from '@/pages/customer/BookingHistory';
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
import PrivacyPolicy from '@/pages/customer/PrivacyPolicy';

// Layouts
import CustomerLayout from '@/components/shared/CustomerLayout';
import AdminLayout from '@/components/shared/AdminLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-thai">Vertical Project</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

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