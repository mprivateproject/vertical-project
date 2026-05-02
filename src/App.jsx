import React, { lazy, Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PageNotFound from './lib/PageNotFound'
import { AuthProvider } from '@/lib/AuthContext'
import { LanguageProvider } from '@/lib/LanguageContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import { LineProvider } from '@/lib/LineContext'
import { SheetProvider } from '@/lib/SheetContext'
import { ViewModeProvider } from '@/lib/ViewModeContext'

// Layouts (not lazy — tiny, always needed)
import CustomerLayout from '@/components/shared/CustomerLayout'
import AdminLayout from '@/components/shared/AdminLayout'

// ─── Customer pages ───────────────────────────────────────────────────────────
const Home             = lazy(() => import('@/pages/customer/Home.jsx'))
const Services         = lazy(() => import('@/pages/customer/Services'))
const BookingFlow      = lazy(() => import('@/pages/customer/BookingFlow'))
const BookingHistory   = lazy(() => import('@/pages/customer/BookingHistory'))
const QuickBookingPage = lazy(() => import('@/pages/customer/QuickBooking'))
// ⚠️  Fix: SelfBookingPage was a duplicate of QuickBooking.
//     If /selfbooking needs different behaviour, create a separate SelfBooking.jsx.
//     For now it reuses QuickBookingPage — rename the route element if that changes.
const Profile          = lazy(() => import('@/pages/customer/Profile'))
const PrivacyPolicy    = lazy(() => import('@/pages/customer/PrivacyPolicy'))
const Price            = lazy(() => import('@/pages/customer/Price'))
const Preferences      = lazy(() => import('@/pages/customer/Preferences'))
const FeedbackPage     = lazy(() => import('@/pages/customer/Feedback'))
const About            = lazy(() => import('@/pages/customer/About'))
const Contact          = lazy(() => import('@/pages/customer/Contact'))
const Countdown        = lazy(() => import('@/pages/customer/Countdown'))

<<<<<<< Updated upstream
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
import AdminAvailability from '@/pages/admin/AdminAvailability';
import AdminTherapistSchedule from '@/pages/admin/AdminTherapistSchedule';
import AdminCalendarBlocks from '@/pages/admin/AdminCalendarBlocks';
import PrivacyPolicy from '@/pages/customer/PrivacyPolicy';
import Price from '@/pages/customer/Price';
import Preferences from '@/pages/customer/Preferences';
import FeedbackPage from '@/pages/customer/Feedback';
import About from '@/pages/customer/About';
import Contact from '@/pages/customer/Contact';
import Countdown from '@/pages/customer/Countdown';
=======
// ─── Staff pages ──────────────────────────────────────────────────────────────
const StaffDashboard   = lazy(() => import('@/pages/staff/StaffDashboard'))
>>>>>>> Stashed changes

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboard       = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminCalendar        = lazy(() => import('@/pages/admin/AdminCalendar'))
const AdminServices        = lazy(() => import('@/pages/admin/AdminServices'))
const AdminCustomers       = lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminCustomerDetail  = lazy(() => import('@/pages/admin/AdminCustomerDetail'))
const AdminReports         = lazy(() => import('@/pages/admin/AdminReports'))
const AdminPromotions      = lazy(() => import('@/pages/admin/AdminPromotions'))
const AdminLoyalty         = lazy(() => import('@/pages/admin/AdminLoyalty'))
const AdminInvitedMembers  = lazy(() => import('@/pages/admin/AdminInvitedMembers'))
const AdminSettings        = lazy(() => import('@/pages/admin/AdminSettings'))
const ScheduleBoard        = lazy(() => import('@/pages/admin/ScheduleBoard'))
const AdminCostDashboard   = lazy(() => import('@/pages/admin/AdminCostDashboard'))
const AdminFeedback        = lazy(() => import('@/pages/admin/AdminFeedback'))
const AdminAvailability    = lazy(() => import('@/pages/admin/AdminAvailability'))

// ─── Page loading fallback ────────────────────────────────────────────────────
// Replace with your own skeleton/spinner component as needed.
const PageFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <span>Loading…</span>
  </div>
)

const AuthenticatedApp = () => {
  return (
    // Suspense wraps all routes — each lazy chunk streams in independently.
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Customer routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/"               element={<Home />} />
          <Route path="/services"       element={<Services />} />
          <Route path="/book"           element={<BookingFlow />} />
          <Route path="/bookings"       element={<BookingHistory />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/price"          element={<Price />} />
          <Route path="/quickbooking"   element={<QuickBookingPage />} />
          <Route path="/selfbooking"    element={<QuickBookingPage />} />
          <Route path="/preferences"    element={<Preferences />} />
          <Route path="/feedback"       element={<FeedbackPage />} />
          <Route path="/about"          element={<About />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/countdown"      element={<Countdown />} />
        </Route>

        {/* Staff routes */}
        <Route path="/staff" element={<StaffDashboard />} />

<<<<<<< Updated upstream
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
        <Route path="/admin/availability" element={<AdminAvailability />} />
        <Route path="/admin/cost-dashboard" element={<AdminCostDashboard />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/therapist-schedule" element={<AdminTherapistSchedule />} />
        <Route path="/admin/calendar-blocks" element={<AdminCalendarBlocks />} />
      </Route>
=======
        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin"                          element={<AdminDashboard />} />
          <Route path="/admin/calendar"                 element={<AdminCalendar />} />
          <Route path="/admin/services"                 element={<AdminServices />} />
          <Route path="/admin/customers"                element={<AdminCustomers />} />
          <Route path="/admin/customers/:customerId"    element={<AdminCustomerDetail />} />
          <Route path="/admin/reports"                  element={<AdminReports />} />
          <Route path="/admin/promotions"               element={<AdminPromotions />} />
          <Route path="/admin/loyalty"                  element={<AdminLoyalty />} />
          <Route path="/admin/invited-members"          element={<AdminInvitedMembers />} />
          <Route path="/admin/settings"                 element={<AdminSettings />} />
          <Route path="/admin/schedule"                 element={<ScheduleBoard />} />
          <Route path="/admin/availability"             element={<AdminAvailability />} />
          <Route path="/admin/cost-dashboard"           element={<AdminCostDashboard />} />
          <Route path="/admin/feedback"                 element={<AdminFeedback />} />
        </Route>
>>>>>>> Stashed changes

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  )
}

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
                    {/* ✅ Fix: Toaster is now inside Router so it can use router hooks if needed */}
                    <AuthenticatedApp />
                    <Toaster />
                  </Router>
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
