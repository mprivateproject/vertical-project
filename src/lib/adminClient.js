// Admin API — uses Base44 SDK directly (Base44 auth token is auto-attached)
// Do NOT use liffSyncClient for admin pages — it doesn't carry Base44 auth.

import { base44 } from '@/api/base44Client';

export const adminClient = {
  getBookingsByDate: (bookingDate) =>
    base44.entities.Booking.filter({ booking_date: bookingDate }, 'start_time', 200),

  getAllBookings: (sort = '-booking_date', limit = 1000) =>
    base44.entities.Booking.list(sort, limit),

  updateBooking: (id, data) =>
    base44.entities.Booking.update(id, data),

  getCustomers: () =>
    base44.entities.Customer.list('-created_date', 200),

  getServices: () =>
    base44.entities.Service.list('sort_order', 100),

  saveService: async (serviceData) => {
    if (serviceData.id) {
      const { id, ...rest } = serviceData;
      return base44.entities.Service.update(id, rest);
    }
    return base44.entities.Service.create(serviceData);
  },

  deleteService: (serviceId) =>
    base44.entities.Service.delete(serviceId),

  getPromotions: () =>
    base44.entities.Promotion.list('-created_date', 50),

  savePromotion: async (promoData) => {
    if (promoData.id) {
      const { id, ...rest } = promoData;
      return base44.entities.Promotion.update(id, rest);
    }
    return base44.entities.Promotion.create(promoData);
  },

  deletePromotion: (promoId) =>
    base44.entities.Promotion.delete(promoId),
};