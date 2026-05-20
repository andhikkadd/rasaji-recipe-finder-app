import { useEffect, useState } from 'react';
import { PageShell } from '../components/PageLayout';
import '../components/InfoPageLayout.css';

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'interpretation-definitions', label: '1. Interpretation & Definitions' },
  { id: 'data-collected', label: '2. Data We Collect' },
  { id: 'usage-data', label: '3. Usage Data' },
  { id: 'cookies-tracking', label: '4. Cookies & Tracking' },
  { id: 'how-we-use', label: '5. How We Use Data' },
  { id: 'sharing-data', label: '6. Sharing of Data' },
  { id: 'retention-data', label: '7. Retention of Data' },
  { id: 'deletion-data', label: '8. Deletion of Data' },
  { id: 'transfer-data', label: '9. Transfer of Data' },
  { id: 'security-data', label: '10. Security of Data' },
  { id: 'children-privacy', label: '11. Children\'s Privacy' },
  { id: 'other-links', label: '12. Links to Other Sites' },
  { id: 'policy-changes', label: '13. Changes to Policy' },
  { id: 'contact-us', label: '14. Contact Us' }
];

export function PrivasiPage() {
  const [activeSection, setActiveSection] = useState('interpretation-definitions');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-120px 0px -50% 0px', threshold: 0.1 }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <PageShell
      title="Kebijakan Privasi"
      subtitle="Halaman ini menjelaskan bagaimana Rasaji mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda."
      breadcrumbItems={[{ label: 'Privasi' }]}
    >
      <div className="policy-last-updated" style={{ marginTop: 0 }}>
        Last updated: May 20, 2026
      </div>

      <div className="policy-container">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="policy-sidebar">
          <h3 className="policy-sidebar-title">Table of Contents</h3>
          <ul className="policy-nav-list">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`policy-nav-button ${activeSection === section.id ? 'active' : ''}`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Policy Content Sections */}
        <div className="policy-body">
          
          <section id="interpretation-definitions" className="policy-body-section">
            <h2>1. Interpretation and Definitions</h2>
            <h3>Interpretation</h3>
            <p>
              The words of which the initial letter is capitalized have meanings defined under the following conditions. 
              The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </p>
            <h3>Definitions</h3>
            <p>For the purposes of this Privacy Policy:</p>
            
            <div className="policy-definition-block">
              <div className="policy-definition-title">Account</div>
              <p className="policy-definition-desc">
                Means a unique account created for You to access our Service or parts of our Service.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Affiliate</div>
              <p className="policy-definition-desc">
                Means an entity that controls, is controlled by, or is under common control with a party, 
                where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Company</div>
              <p className="policy-definition-desc">
                Refers to Rasaji (referred to as either "the Company", "We", "Us" or "Our" in this Privacy Policy).
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Cookies</div>
              <p className="policy-definition-desc">
                Are small files that are placed on Your computer, mobile device or any other device by a website, 
                containing the details of Your browsing history on that website among its many uses.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Country</div>
              <p className="policy-definition-desc">Refers to: Indonesia.</p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Device</div>
              <p className="policy-definition-desc">
                Means any device that can access the Service such as a computer, a cell phone or a digital tablet.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Personal Data</div>
              <p className="policy-definition-desc">
                Is any information that relates to an identified or identifiable individual.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Service</div>
              <p className="policy-definition-desc">Refers to the Website.</p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Service Provider</div>
              <p className="policy-definition-desc">
                Means any natural or legal person who processes the data on behalf of the Company. It refers to third-party 
                companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of 
                the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Usage Data</div>
              <p className="policy-definition-desc">
                Refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">Website</div>
              <p className="policy-definition-desc">
                Refers to Rasaji, accessible from <a href="https://rasaji-808041536348.us-central1.run.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>https://rasaji-808041536348.us-central1.run.app/</a>.
              </p>
            </div>

            <div className="policy-definition-block">
              <div className="policy-definition-title">You</div>
              <p className="policy-definition-desc">
                Means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
              </p>
            </div>
          </section>

          <section id="data-collected" className="policy-body-section">
            <h2>2. Data We Collect</h2>
            <p>
              While using Our Service, We may ask You to provide Us with certain personally identifiable information 
              that can be used to contact or identify You. Personally identifiable information may include:
            </p>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
            </ul>
          </section>

          <section id="usage-data" className="policy-body-section">
            <h2>3. Usage Data</h2>
            <p>Usage Data is collected automatically when using the Service.</p>
            <p>
              Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, 
              browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, 
              unique device identifiers and other diagnostic data.
            </p>
            <p>
              When You access the Service by or through a mobile device, We may collect certain information automatically, including, 
              but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, 
              Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
            </p>
          </section>

          <section id="cookies-tracking" className="policy-body-section">
            <h2>4. Cookies and Tracking Technologies</h2>
            <p>
              We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. 
              Tracking technologies We use include beacons, tags, and scripts to collect and track information and to improve and analyze Our Service.
            </p>
            <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
            
            <ul>
              <li>
                <strong>Necessary / Essential Cookies (Session Cookies):</strong> Administered by Us. These Cookies are essential to provide 
                You with services available through the Website and to enable You to use some of its features. They help to authenticate 
                users and prevent fraudulent use of user accounts.
              </li>
              <li>
                <strong>Cookies Policy / Notice Acceptance Cookies (Persistent Cookies):</strong> Administered by Us. These Cookies identify 
                if users have accepted the use of cookies on the Website.
              </li>
              <li>
                <strong>Functionality Cookies (Persistent Cookies):</strong> Administered by Us. These Cookies allow Us to remember choices 
                You make when You use the Website, such as remembering your login details or language preference. The purpose of these 
                Cookies is to provide You with a more personal experience.
              </li>
            </ul>
          </section>

          <section id="how-we-use" className="policy-body-section">
            <h2>5. How We Use Data</h2>
            <p>The Company may use Personal Data for the following purposes:</p>
            <ul>
              <li><strong>To provide and maintain our Service:</strong> Including to monitor the usage of our Service.</li>
              <li><strong>To manage Your Account:</strong> To manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service.</li>
              <li><strong>For the performance of a contract:</strong> The development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.</li>
              <li><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication regarding updates or informative communications.</li>
              <li><strong>To provide You with news/offers:</strong> General information about other recipes, services and events which We offer that are similar to those that you have already purchased or inquired about.</li>
              <li><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
              <li><strong>For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.</li>
              <li><strong>For other purposes:</strong> Data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.</li>
            </ul>
          </section>

          <section id="sharing-data" className="policy-body-section">
            <h2>6. Sharing of Your Data</h2>
            <p>We may share Your Personal Data in the following situations:</p>
            <ul>
              <li><strong>With Service Providers:</strong> We may share Your Personal Data with Service Providers to monitor and analyze the use of our Service, or to contact You.</li>
              <li><strong>For business transfers:</strong> We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business.</li>
              <li><strong>With Affiliates:</strong> We may share Your Personal Data with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</li>
              <li><strong>With business partners:</strong> We may share Your Personal Data with Our business partners to offer You certain products, services or promotions.</li>
              <li><strong>With other users:</strong> When You share Personal Data or otherwise interact in public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</li>
              <li><strong>With Your consent:</strong> We may disclose Your Personal Data for any other purpose with Your consent.</li>
            </ul>
          </section>

          <section id="retention-data" className="policy-body-section">
            <h2>7. Retention of Your Data</h2>
            <p>
              The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. 
              We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, 
              and enforce our legal agreements and policies.
            </p>
            <p>The following table outlines the maximum retention periods applied to different categories of Personal Data:</p>
            
            <table className="policy-meta-table">
              <thead>
                <tr>
                  <th>Data Category</th>
                  <th>Description</th>
                  <th>Maximum Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Account Information</strong></td>
                  <td>User Profile details (Email, Name, Password Hash)</td>
                  <td>Active account duration + up to 24 months post-closure</td>
                </tr>
                <tr>
                  <td><strong>Customer Support Data</strong></td>
                  <td>Support tickets, bug reports, and correspondence transcripts</td>
                  <td>Up to 24 months from ticket closure</td>
                </tr>
                <tr>
                  <td><strong>Usage Data</strong></td>
                  <td>Website analytics data (cookies, IP addresses, device identifiers)</td>
                  <td>Up to 24 months from collection date</td>
                </tr>
                <tr>
                  <td><strong>Server Logs</strong></td>
                  <td>Server access logs, diagnostics, and IP records</td>
                  <td>Up to 24 months for security and audit monitoring</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="deletion-data" className="policy-body-section">
            <h2>8. Deletion of Your Data</h2>
            <p>
              You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. 
              Our Service provides options for You to delete certain information about You directly from within the Service.
            </p>
            <p>
              You may update, amend, or delete Your information at any time by signing in to Your Account and visiting the account settings 
              section, or by contacting us to request access to, correct, or delete any Personal Data that You have provided to Us.
            </p>
            <p>
              Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.
            </p>
          </section>

          <section id="transfer-data" className="policy-body-section">
            <h2>9. Transfer of Your Data</h2>
            <p>
              Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the 
              parties involved in the processing are located. It means that this information may be transferred to — and maintained on — 
              computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ.
            </p>
            <p>
              Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer. 
              The Company will take all steps reasonably necessary to ensure that Your data is treated securely.
            </p>
          </section>

          <section id="security-data" className="policy-body-section">
            <h2>10. Security of Your Data</h2>
            <p>
              The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, 
              or method of electronic storage is 100% secure.
            </p>
            <p>
              While We strive to use commercially acceptable means to protect Your Personal Data, we cannot guarantee its absolute security. 
              Although we work hard to safeguard your data, no method of transmission or electronic storage is completely secure.
            </p>
          </section>

          <section id="children-privacy" className="policy-body-section">
            <h2>11. Children's Privacy</h2>
            <p>
              Our Service does not address anyone under the age of 16. We do not knowingly collect personally identifiable information 
              from anyone under the age of 16.
            </p>
            <p>
              If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. 
              If We become aware that We have collected Personal Data from anyone under the age of 16 without verification of parental consent, 
              We take steps to remove that information from Our servers.
            </p>
          </section>

          <section id="other-links" className="policy-body-section">
            <h2>12. Links to Other Websites</h2>
            <p>
              Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be 
              directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
            </p>
            <p>
              We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
            </p>
          </section>

          <section id="policy-changes" className="policy-body-section">
            <h2>13. Changes to this Privacy Policy</h2>
            <p>
              We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
            </p>
            <p>
              We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the 
              "Last updated" date at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they 
              are posted on this page.
            </p>
          </section>

          <section id="contact-us" className="policy-body-section">
            <h2>14. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, You can contact us:</p>
            <ul>
              <li>
                By email: <a href="mailto:support@rasaji.com" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>support@rasaji.com</a>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </PageShell>
  );
}
