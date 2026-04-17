import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground text-[15px]">Privacy Policy</h1>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-16 max-w-2xl mx-auto space-y-6 text-[13px] text-foreground leading-relaxed">
        <p className="text-muted-foreground text-[12px]">Updated at 2026-04-17</p>

        <p>
          M Private Project ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
          explains how your personal information is collected, used, and disclosed by M Private Project.
        </p>

        <Section title="What Information Do We Collect?">
          <p>We collect information from you when you visit our app, register on our site, place an order, or fill out a form.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>Name / Username</li>
            <li>Phone Numbers</li>
            <li>Email Addresses</li>
            <li>LINE User ID and profile information</li>
          </ul>
        </Section>

        <Section title="How Do We Use The Information We Collect?">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>To personalize your experience</li>
            <li>To improve our app</li>
            <li>To improve customer service</li>
            <li>To process transactions and bookings</li>
            <li>To send periodic emails and LINE notifications about your bookings</li>
          </ul>
        </Section>

        <Section title="How Do We Use Your Email Address?">
          <p>
            By submitting your email address on this app, you agree to receive emails from us regarding your bookings and services.
            You can cancel your participation in any of these email lists at any time by contacting us.
          </p>
        </Section>

        <Section title="Do we share the information we collect with third parties?">
          <p>
            We may share your information with trusted third-party service providers who assist us in operating our app and providing
            services to you, such as hosting, database management, and email delivery. We do not sell your personal information to
            third parties.
          </p>
        </Section>

        <Section title="How Do We Protect Your Information?">
          <p>
            We implement a variety of security measures to maintain the safety of your personal information.
            All sensitive information is transmitted via Secure Socket Layer (SSL) technology.
          </p>
        </Section>

        <Section title="How Long Do We Keep Your Information?">
          <p>
            We keep your information only so long as we need it to provide services to you and fulfill the purposes described in
            this policy. When we no longer need to use your information, we'll either remove it from our systems or depersonalize it.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            You have the right to request access to, correction of, or deletion of your personal information at any time.
            Please contact us if you wish to exercise these rights.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have any questions about this Privacy Policy, please contact us at M Private Project.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-foreground text-[14px]">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}