import LegalPageLayout from "./LegalPageLayout";

function SecurityPage() {
  return (
    <LegalPageLayout
      eyebrow="Security"
      title="IceBreaker uses practical safeguards, not exaggerated promises."
      intro="This page summarizes the protections used in the app and the limits users should keep in mind."
    >
      <div className="legal-content">
        <section className="legal-section">
          <h3>Current safeguards</h3>
          <ul className="comparison-list legal-list">
            <li>Account access is protected through sign-in controls</li>
            <li>
              Access rules help restrict who can read or change protected data
            </li>
            <li>
              User-specific permissions are used for profiles, voting, and
              submissions
            </li>
            <li>
              Admin and moderation controls are used where needed to review
              content and reduce abuse
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>Important limits</h3>
          <p>
            No internet service can guarantee complete security. Because of
            that, users should avoid sharing sensitive personal, financial,
            medical, password, or other secret information through IceBreaker.
          </p>
        </section>

        <section className="legal-section">
          <h3>Responsible disclosure</h3>
          <p>
            If you believe you found a security issue, report it to{" "}
            <a href="mailto:abhijeetskakade04@gmail.com">
              abhijeetskakade04@gmail.com
            </a>{" "}
            with enough detail for us to review it. Please avoid public
            disclosure until we have had a reasonable chance to investigate.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}

export default SecurityPage;
