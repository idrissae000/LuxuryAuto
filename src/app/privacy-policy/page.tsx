export default function PrivacyPolicyPage() {
  return (
    <section className="section-shell max-w-4xl space-y-6">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <div className="card space-y-4 text-white/80">
        <p className="text-sm text-white/60">Last updated: March 9, 2026</p>

        <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
        <p>
          When you book a service with Luxury Auto Detailz, we collect the following personal information: your name,
          phone number, email address, service address, and booking details (service type, date, and time).
        </p>

        <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Schedule and manage your detailing appointments</li>
          <li>Send appointment confirmations and reminders via SMS to the phone number you provide</li>
          <li>Communicate with you about your bookings</li>
          <li>Improve our services</li>
        </ul>

        <h2 className="text-xl font-semibold text-white">SMS Notifications</h2>
        <p>
          By providing your phone number when booking a service, you consent to receive SMS notifications related to your
          appointment from Luxury Auto Detailz. These messages are sent using Twilio, a third-party communications
          platform. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe or HELP for
          assistance.
        </p>

        <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
        <p>
          We use Twilio to deliver SMS notifications. Twilio may process your phone number and message content in
          accordance with their own privacy policy. We do not sell, rent, or share your personal data with third parties
          for marketing purposes.
        </p>

        <h2 className="text-xl font-semibold text-white">Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes outlined in this
          policy, including completing your service and maintaining booking records.
        </p>

        <h2 className="text-xl font-semibold text-white">Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information at any time by contacting
          us.
        </p>

        <h2 className="text-xl font-semibold text-white">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:hello@luxuryautodetailz.com" className="text-brand-blue hover:underline">
            hello@luxuryautodetailz.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
