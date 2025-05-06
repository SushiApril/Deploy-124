'use client';

import styles from './Terms.module.css'; 

const TermsPage = () => {
  return (
    <div className={styles.termsContainer}>
      {/* Header Box with styles from the CSS Module */}
      <div className={styles.headerBox}>
        <header className={styles.headerContent}>
          <h1>Terms and Privacy</h1>

          <section className={styles.termsService}>
            <h2>Terms of Service</h2>
            <p>Welcome to FinanceForge. By using our website and services, you agree to the following terms:</p>
            <ul>
              <li><strong>Use of Service:</strong> You agree to use FinanceForge only for lawful purposes. You must not misuse or attempt to harm the platform.</li>
              <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and password.</li>
              <li><strong>Modifications:</strong> FinanceForge may update the service and these terms at any time. We'll do our best to notify you of major changes.</li>
            </ul>
            <p>If you do not agree with these terms, please do not use our service.</p>
          </section>

          <section className={styles.privacyPolicy}>
            <h2>Privacy Policy</h2>
            <p>Your privacy is important to us. Here’s how we protect and use your data:</p>
            <ul>
              <li><strong>Information Collection:</strong> We collect information you provide when signing up, such as your name, email, and financial data.</li>
              <li><strong>How We Use It:</strong> This data helps us provide services like budget tracking, financial reports, and personalized insights.</li>
              <li><strong>Security:</strong> We implement strict security measures to protect your information.</li>
              <li><strong>No Sharing:</strong> We do not sell or share your data with third parties without your consent.</li>
            </ul>
          </section>
        </header>
      </div>
    </div>
  );
};

export default TermsPage;
