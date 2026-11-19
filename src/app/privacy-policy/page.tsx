import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Lock, UserCheck, Eye, Database,
  FileText, Mail, Phone, ExternalLink, AlertCircle,
  CheckCircle2, Globe, Clock, RefreshCw, Key
} from 'lucide-react';
import { CONTACT_INFO, TRIP_METADATA } from '@/lib/constants';

export const metadata = {
  title: 'Privacy Policy | Himalayan Escape — Student Mountain Expedition',
  description:
    'Comprehensive privacy disclosures detailing data collection, Google OAuth, Google Contacts (contacts.readonly), storage, and user privacy rights for Himalayan Escape.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-[#F7F5EF] text-[#171918] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3 border-b border-[#D8D2C4] pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#163C32]/10 text-[#163C32] uppercase tracking-widest border border-[#163C32]/20">
              Official Privacy Disclosure
            </span>
            <span className="text-[11px] text-[#646864] font-medium">
              Effective Date: November 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#171918] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#646864] leading-relaxed max-w-3xl">
            This Privacy Policy describes how <strong>Himalayan Escape</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, processes, and protects your personal information when you visit our website, sign in with your Google or mobile account, use our booking system, and access our optional Google Contacts autofill integration.
          </p>
        </div>

        {/* Executive Transparency Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-[#163C32]">
            <ShieldCheck className="w-5 h-5 text-[#D87945] shrink-0" />
            <h2 className="text-base font-bold text-[#171918]">Our Commitment to Privacy & Minimal Data Processing</h2>
          </div>
          <p className="text-xs text-[#646864] leading-relaxed">
            Himalayan Escape is an independent travel portal created for student group mountain expeditions. We believe in strict data minimization. We only collect information strictly required to coordinate tourist coach seating, prepare legally mandated passenger manifests for state border checkpoints, allocate mountain resort rooms, process payments via RBI-authorized gateways, and ensure high-altitude traveller safety.
          </p>
        </div>

        {/* Section 1: Application Identity */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <FileText className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">1. Application Identity & Data Controller</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>
              <strong>Application Name:</strong> Himalayan Escape (Student Mountain Expedition)
            </p>
            <p>
              <strong>Nature of Service:</strong> Expedition booking, tourist coach seat allocation, digital QR boarding pass delivery, and student travel coordination between Mathura, Uttar Pradesh and Manali / Kasol, Himachal Pradesh.
            </p>
            <p>
              <strong>Lead Organizer & Data Controller:</strong> Shrikant Thakur
            </p>
            <p>
              <strong>Contact Email:</strong>{' '}
              <a href="mailto:shrikant.thakur_cs26@gmail.com" className="font-semibold text-[#163C32] hover:underline">
                shrikant.thakur_cs26@gmail.com
              </a>
            </p>
            <p>
              <strong>Operational Helplines:</strong>{' '}
              <span className="font-mono font-medium">{CONTACT_INFO.coordinatorPhone1}</span> /{' '}
              <span className="font-mono font-medium">{CONTACT_INFO.coordinatorPhone2}</span>
            </p>
          </div>
        </div>

        {/* Section 2: Information We Collect */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Database className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">2. Information We Collect</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-3 leading-relaxed">
            <p>We collect information in three ways: information you provide voluntarily, information received from authentication providers, and technical device data.</p>

            <div className="space-y-2.5 pt-1">
              <h3 className="font-bold text-[#163C32] text-xs uppercase tracking-wider">A. Personal Details Provided for Booking</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
                <li><strong>Lead Traveller:</strong> Full legal name, mobile phone number, verified email address, gender, sitting preference.</li>
                <li><strong>Additional Passengers:</strong> Full legal names, mobile phone numbers, optional email addresses, and gender for coach seat allocation.</li>
                <li><strong>Student Identity Verification:</strong> College roll number or student ID (optional, used for student identity verification prior to coach boarding).</li>
                <li><strong>Emergency Contacts:</strong> Parent or guardian contact name and verified 10-digit emergency telephone number for each passenger.</li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <h3 className="font-bold text-[#163C32] text-xs uppercase tracking-wider">B. Account & Authentication Information</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
                <li><strong>Phone Number Login:</strong> 10-digit mobile number and cryptographically salted password hash (we never store plain-text passwords).</li>
                <li><strong>Google Sign-In:</strong> Google Account ID (`googleId`), verified email address, full name, and public profile picture URL.</li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <h3 className="font-bold text-[#163C32] text-xs uppercase tracking-wider">C. Transaction Information</h3>
              <p className="text-xs text-[#646864]">
                When you make a reservation payment, we receive payment confirmation tokens, transaction IDs, and timestamps from our payment gateway Razorpay. <strong>We do not collect, process, or store credit card numbers, debit card numbers, bank passwords, or UPI PINs</strong> on our servers. All financial transactions are handled directly through Razorpay under PCI-DSS Level 1 compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Google User Data Disclosures */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-[#163C32]">
            <UserCheck className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">3. Google User Data & OAuth Disclosures</h2>
          </div>

          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-4 leading-relaxed">
            <p>
              Himalayan Escape accesses Google user data strictly in accordance with the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#163C32] underline inline-flex items-center gap-1"
              >
                Google API Services User Data Policy <ExternalLink className="w-3 h-3 inline" />
              </a>
              , including the Limited Use requirements.
            </p>

            {/* Google Sign In Subsection */}
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#163C32]">
                Google Sign-In (Scopes: `openid`, `email`, `profile`)
              </h3>
              <p className="text-xs text-[#646864]">
                <strong>Purpose:</strong> Used to securely verify your identity, create an expedition profile, and allow you to log in to access your coach seat reservations and digital QR boarding passes at <Link href="/my-bookings" className="text-[#163C32] font-semibold underline">/my-bookings</Link>.
              </p>
              <p className="text-xs text-[#646864]">
                <strong>Data Accessed & Stored:</strong> Your Google unique user ID, full name, verified email address, and profile picture URL. This basic profile data is stored in our secured PostgreSQL database within your user account record.
              </p>
            </div>

            {/* Google Contacts Subsection */}
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D87945] text-white uppercase">
                  Scope: contacts.readonly
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#163C32]">
                  Google Contacts Read-Only Integration
                </h3>
              </div>

              <div className="space-y-2 text-xs text-[#646864]">
                <p>
                  <strong>Why Contacts Permission Is Requested:</strong> To provide an optional autofill tool during Step 3 of the booking flow. Entering names and 10-digit emergency contact phone numbers on mobile keyboards can be slow and error-prone. This integration lets you select a contact directly from your Google address book to populate passenger names or parent/guardian emergency contacts.
                </p>
                <p>
                  <strong>Strictly Explicit User Action:</strong> We <strong>never</strong> request Google Contacts permission during normal login. The permission popup is triggered <strong>only</strong> when you explicitly click the &ldquo;Import from Google Contacts&rdquo; button in the passenger information form.
                </p>
                <p>
                  <strong>Read-Only Access:</strong> We request only the <code className="bg-white px-1.5 py-0.5 rounded border border-[#D8D2C4] text-[11px] text-[#163C32]">https://www.googleapis.com/auth/contacts.readonly</code> scope. Our application <strong>cannot create, modify, edit, or delete</strong> any contacts in your Google account.
                </p>
                <p>
                  <strong>In-Memory Processing & Non-Retention Policy:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The OAuth 2.0 access token issued by Google is held strictly in temporary browser memory (React state) and is <strong>never saved to cookies, localStorage, or server databases</strong>.</li>
                  <li>Your address book fetched from the Google People API is displayed temporarily in a client-side search modal. <strong>We do not upload, copy, or sync your entire address book to any database or server.</strong></li>
                  <li><strong>Only the specific contact you actively select</strong> has their name and phone number placed into the booking form inputs. You may inspect, edit, or delete this text before continuing.</li>
                  <li>The selected details are saved into our database only when you proceed and finalize your booking submission.</li>
                </ul>
                <p>
                  <strong>No Automated Messaging:</strong> We will <strong>never</strong> send automated promotional messages, SMS, emails, or WhatsApp messages to contacts in your address book.
                </p>
                <p>
                  <strong>How to Disconnect & Revoke Access:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Within our app: Click the <strong>&ldquo;Disconnect&rdquo;</strong> button in the Google Contacts selection modal or banner to immediately clear the in-memory access token.</li>
                  <li>Via Google Account: You can revoke Himalayan Escape&apos;s permission at any time at{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#163C32] underline"
                    >
                      Google Security Settings &gt; Third-party apps with account access
                    </a>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Databases and Technical Infrastructure */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Database className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">4. Database Storage & Technical Infrastructure</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2.5 leading-relaxed">
            <p>
              Based on our verified application architecture:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
              <li><strong>Database:</strong> Our application uses a PostgreSQL relational database accessed through Prisma ORM (hosted with Supabase). It stores registered user accounts, coach seat allocations, payment receipts, traveller names, and ticket records.</li>
              <li><strong>Authentication Architecture:</strong> Session management uses cryptographically signed HMAC-SHA256 tokens stored in HTTP-only, secure session cookies (<code className="bg-[#F7F5EF] px-1 py-0.5 rounded text-[11px]">user_session</code> / <code className="bg-[#F7F5EF] px-1 py-0.5 rounded text-[11px]">gla_user_session</code>).</li>
              <li><strong>Media Storage:</strong> Public trip gallery images and memories are stored on private S3-compatible cloud storage (Supabase S3).</li>
              <li><strong>Hosting & Edge CDN:</strong> The website is deployed and hosted on Vercel Inc.&apos;s secure global infrastructure.</li>
            </ul>
          </div>
        </div>

        {/* Section 5: Cookies and Session Information */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Key className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">5. Cookies & Session Information</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>We use strictly essential technical cookies necessary for the operation of the portal:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#646864]">
              <li><code className="bg-[#F7F5EF] px-1.5 py-0.5 rounded border border-[#D8D2C4] text-[11px]">user_session</code> and <code className="bg-[#F7F5EF] px-1.5 py-0.5 rounded border border-[#D8D2C4] text-[11px]">gla_user_session</code>: Essential authentication cookies marked <code className="text-[#163C32] font-mono">HttpOnly</code>, <code className="text-[#163C32] font-mono">SameSite=Lax</code>, and <code className="text-[#163C32] font-mono">Secure</code> in production to keep you signed in securely.</li>
              <li><code className="bg-[#F7F5EF] px-1.5 py-0.5 rounded border border-[#D8D2C4] text-[11px]">admin_session</code>: Authenticates authorized trip coordinators accessing passenger boarding checklists and check-in scanners.</li>
            </ul>
            <p className="text-xs text-[#646864]">We do not use invasive third-party cross-site advertising trackers or sell browsing data to data brokers.</p>
          </div>
        </div>

        {/* Section 6: Purpose and Legal Basis */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <CheckCircle2 className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">6. Purpose & Legal Basis for Processing</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>We process personal information under the following legal bases:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
              <li><strong>Performance of a Contract:</strong> Reserving coach seats, delivering digital boarding passes, booking resort rooms, and fulfilling your travel itinerary.</li>
              <li><strong>Legal & Compliance Obligations:</strong> Preparing passenger manifests for transport authorities and police checkpoints along the NH-3/NH-21 mountain corridors, and complying with Indian taxation laws.</li>
              <li><strong>Vital Interests (Passenger Safety):</strong> Maintaining emergency contact numbers for parents or guardians during high-altitude travel in Himachal Pradesh.</li>
              <li><strong>Consent:</strong> When you voluntarily connect your Google Account or choose to autofill information via Google Contacts.</li>
            </ul>
          </div>
        </div>

        {/* Section 7: Data Retention and Deletion */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Clock className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">7. Data Retention & Deletion</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>
              We retain active booking information, passenger manifests, and payment records for the duration of the expedition and up to <strong>180 days post-departure</strong> to resolve post-trip coordinator queries, billing verifications, and legal requirements.
            </p>
            <p>
              Users may request deletion of their account or personal information at any time by emailing{' '}
              <a href="mailto:shrikant.thakur_cs26@gmail.com" className="font-semibold text-[#163C32] hover:underline">
                shrikant.thakur_cs26@gmail.com
              </a>
              . Verified deletion requests are executed within 14 business days, subject to mandatory statutory tax retention obligations.
            </p>
          </div>
        </div>

        {/* Section 8: Third-Party Data Sharing */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Globe className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">8. Data Sharing & Third-Party Service Providers</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>
              <strong>We do not sell, rent, or trade your personal information.</strong> Information is shared solely with trusted operational partners required to deliver the trip:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
              <li><strong>Transport Operators & Bus Drivers:</strong> Passenger names and seat numbers for coach boarding gate verification.</li>
              <li><strong>Resort & Hotel Partners:</strong> Guest names for room allocation at hotels in Manali and riverside camps in Kasol.</li>
              <li><strong>Payment Processing:</strong> Razorpay Software Private Ltd. for secure transaction processing.</li>
              <li><strong>Infrastructure:</strong> Vercel (Hosting), Supabase (PostgreSQL & Storage), Google APIs (OAuth & People API).</li>
              <li><strong>Law Enforcement & Public Authorities:</strong> Only when required by law or to ensure passenger safety during accidents or mountain emergencies.</li>
            </ul>
          </div>
        </div>

        {/* Section 9: Security Safeguards */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Lock className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">9. Security Safeguards</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>We implement technical and organizational safeguards to protect your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
              <li><strong>HTTPS Encryption:</strong> All data in transit is encrypted using TLS 1.3 encryption.</li>
              <li><strong>Ephemeral Token Handling:</strong> Google OAuth access tokens are stored in memory only and never written to non-volatile disk or database records.</li>
              <li><strong>Cryptographic Digital QR Boarding Passes:</strong> Digital tickets contain high-entropy, randomized 32-character tokens rather than raw personal details. Only authorized coordinator scanner accounts can validate passes.</li>
              <li><strong>Password Hashing:</strong> Passwords are protected using salted <code className="text-[#163C32] font-mono">scrypt</code> key derivation.</li>
            </ul>
          </div>
        </div>

        {/* Section 10: User Rights */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <Eye className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">10. Your Privacy Rights</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#171918]/85 space-y-2 leading-relaxed">
            <p>You possess rights concerning your personal data, including:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#646864]">
              <li><strong>Right to Access:</strong> View your active reservations and passenger allocations at <Link href="/my-bookings" className="text-[#163C32] underline font-semibold">/my-bookings</Link>.</li>
              <li><strong>Right to Rectification:</strong> Request correction of misspelled traveller names or phone numbers prior to coach manifest locking.</li>
              <li><strong>Right to Withdraw Consent:</strong> Revoke Google Sign-In or Google Contacts permissions at any time.</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your user account and personal details.</li>
            </ul>
          </div>
        </div>

        {/* Section 11: Children's Privacy */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <AlertCircle className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-[#171918]">11. Children&apos;s Privacy</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#646864] leading-relaxed">
            Himalayan Escape is a student tour program intended for university students and adults aged 18 and older. We do not knowingly solicit or collect personal information from individuals under the age of 18 without explicit parental or guardian involvement.
          </p>
        </div>

        {/* Section 12: Google Non-Endorsement Disclaimer */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#163C32]">
            12. Third-Party Trademarks & Google Non-Endorsement
          </h2>
          <p className="text-xs text-[#171918]/80 leading-relaxed">
            Google, Google Contacts, Google Sign-In, and the Google logo are trademarks of Google LLC. Himalayan Escape is an independent travel expedition service and is not affiliated with, endorsed by, sponsored by, or operated by Google LLC.
          </p>
        </div>

        {/* Section 13: Policy Updates */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs space-y-3">
          <h2 className="text-base font-bold text-[#171918]">13. Changes to This Privacy Policy</h2>
          <p className="text-xs sm:text-sm text-[#646864] leading-relaxed">
            We may update this Privacy Policy periodically to reflect enhancements to our travel operations, security practices, or regulatory requirements. Any updates will be published directly on this page with a revised effective date.
          </p>
        </div>

        {/* Section 14: Contact Information */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#163C32] text-white space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-[#D87945]">
            <Mail className="w-5 h-5 text-[#D87945]" />
            <h2 className="text-lg font-bold text-white">14. Contact Us Regarding Privacy Inquiries</h2>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            For questions about this Privacy Policy, your personal data, or data deletion requests, please contact our lead coordinator:
          </p>
          <div className="space-y-1.5 text-xs text-white/90">
            <p><strong>Coordinator & Developer:</strong> Shrikant Thakur</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:shrikant.thakur_cs26@gmail.com" className="underline hover:text-[#D87945] font-semibold">
                shrikant.thakur_cs26@gmail.com
              </a>
            </p>
            <p><strong>Hotlines:</strong> <span className="font-mono">{CONTACT_INFO.coordinatorPhone1}</span> / <span className="font-mono">{CONTACT_INFO.coordinatorPhone2}</span></p>
            <p><strong>Expedition Desk:</strong> Himalayan Escape, Mathura, Uttar Pradesh 281406, India</p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F5EF] text-[#163C32] text-xs font-bold transition-all shadow-sm"
            >
              Back to Himalayan Escape Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
