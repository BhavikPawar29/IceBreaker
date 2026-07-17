import LegalPageLayout from "./LegalPageLayout";
import AnalyticsConsentSettings from "../../../shared/ui/AnalyticsConsentSettings";

function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy Policy"
      title="IceBreaker uses limited data only to run the app."
      intro="This page explains what IceBreaker collects, why it is needed, and how public anonymous sharing works."
      image="/editorial/legal-privacy.png"
      imageAlt="Rain on a window beside a quiet table with coffee and a reading lamp"
    >
      <div className="legal-content">
        <section className="legal-section">
          <h3>What we collect</h3>
          <p>
            IceBreaker uses third-party service providers and cloud
            infrastructure to run core account and community features.
          </p>
          <ul className="comparison-list legal-list">
            <li>
              Account information such as your email address and profile details
            </li>
            <li>
              Private profile information such as your display name and account
              email
            </li>
            <li>
              Ideas you submit, votes connected to your account, and related app
              records
            </li>
            <li>
              Review and moderation records used to keep the app safe and usable
            </li>
            <li>
              Limited browser storage for simple app behavior, such as hiding
              the install prompt, remembering analytics consent, or slowing
              repeated submissions
            </li>
            <li>
              Usage analytics collected through Firebase Analytics only if you
              accept analytics cookies
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>How we use it</h3>
          <ul className="comparison-list legal-list">
            <li>To let users sign in and access their account</li>
            <li>To show, review, vote on, and manage submitted ideas</li>
            <li>To support profiles, moderation, and abuse prevention</li>
            <li>To run the app and its core community features</li>
            <li>
              To understand product usage and improve the app when analytics
              consent is given
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>Analytics cookies</h3>
          <p>
            Breaking Ice uses Firebase Analytics to understand aggregate product
            usage. Analytics stays off until you accept analytics cookies, and
            you can decline them without losing access to the core app.
          </p>
        </section>

        <AnalyticsConsentSettings />

        <section className="legal-section">
          <h3>Public and private data</h3>
          <p>
            Approved ideas can appear publicly in anonymous form. At the same
            time, the app may keep internal account-linked records so it can run
            accounts, moderation, voting, and abuse prevention properly.
          </p>
        </section>

        <section className="legal-section">
          <h3>Data sales and unrelated reuse</h3>
          <p>
            IceBreaker does not sell personal data. Account and submission data
            are used to operate the service, not for unrelated commercial use
            outside the app.
          </p>
        </section>

        <section className="legal-section">
          <h3>Contact</h3>
          <p>
            For privacy questions or concerns, contact{" "}
            <a href="mailto:abhijeetskakade04@gmail.com">
              abhijeetskakade04@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}

export default PrivacyPage;
