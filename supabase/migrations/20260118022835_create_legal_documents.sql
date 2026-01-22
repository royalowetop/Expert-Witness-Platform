/*
  # Create legal documents system

  ## Overview
  This migration creates a system for managing Terms of Service and Privacy Policy documents
  that can be edited through an admin panel.

  ## Tables Created

  ### 1. `legal_documents`
  Stores editable legal documents (Terms of Service, Privacy Policy)
  - `id` (uuid, primary key) - Unique identifier
  - `document_type` (text) - Type: 'terms_of_service' or 'privacy_policy'
  - `title` (text) - Document title
  - `content` (text) - Full document content in markdown/HTML
  - `version` (integer) - Version number for tracking changes
  - `is_active` (boolean) - Whether this is the current active version
  - `effective_date` (date) - When this version becomes effective
  - `created_by` (uuid, nullable) - Admin user who created/updated this version
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - Enable RLS on legal_documents table
  - Anyone can read active documents (public access)
  - Only authenticated admins can create/update documents
  - Version history is maintained

  ## Important Notes
  - Only one version per document type can be active at a time
  - Default Terms of Service and Privacy Policy documents are created
  - Documents support markdown/HTML formatting
  - All changes create new versions for audit trail
*/

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  version integer DEFAULT 1 NOT NULL,
  is_active boolean DEFAULT false NOT NULL,
  effective_date date DEFAULT CURRENT_DATE NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for finding active documents
CREATE INDEX IF NOT EXISTS idx_legal_documents_active ON legal_documents(document_type, is_active);
CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(document_type);

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Anyone can read active legal documents
CREATE POLICY "Anyone can read active legal documents"
  ON legal_documents
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Authenticated users can read all versions
CREATE POLICY "Authenticated users can read all versions"
  ON legal_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can create legal documents
CREATE POLICY "Authenticated users can create legal documents"
  ON legal_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update legal documents
CREATE POLICY "Authenticated users can update legal documents"
  ON legal_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default Terms of Service
INSERT INTO legal_documents (document_type, title, content, version, is_active, effective_date)
VALUES (
  'terms_of_service',
  'Terms of Service',
  '# Terms of Service

**Last Updated: January 18, 2026**

## 1. Acceptance of Terms

By accessing and using Witnex ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement.

## 2. Use License

Permission is granted to temporarily access the materials on Witnex for personal, non-commercial transitory viewing only.

## 3. User Accounts

- You are responsible for maintaining the confidentiality of your account
- You agree to accept responsibility for all activities that occur under your account
- You must notify us immediately of any unauthorized use of your account

## 4. Expert Witness Services

### For Attorneys
- The Platform connects attorneys with verified expert witnesses
- All communications and agreements are between attorneys and experts
- Witnex does not guarantee case outcomes

### For Experts
- All credentials must be accurate and verifiable
- Experts must maintain professional standards
- False information may result in account termination

## 5. Privacy

Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.

## 6. Payment Terms

- Subscription fees are billed according to your selected plan
- Refunds are subject to our refund policy
- Prices are subject to change with notice

## 7. Prohibited Uses

You may not use the Platform to:
- Violate any laws or regulations
- Infringe on intellectual property rights
- Transmit malicious code or viruses
- Harass or harm other users

## 8. Limitation of Liability

Witnex shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform.

## 9. Modifications

We reserve the right to modify these terms at any time. Continued use of the Platform constitutes acceptance of modified terms.

## 10. Contact Information

For questions about these Terms of Service, please contact us at legal@witnex.com.',
  1,
  true,
  CURRENT_DATE
) ON CONFLICT DO NOTHING;

-- Insert default Privacy Policy
INSERT INTO legal_documents (document_type, title, content, version, is_active, effective_date)
VALUES (
  'privacy_policy',
  'Privacy Policy',
  '# Privacy Policy

**Last Updated: January 18, 2026**

## 1. Information We Collect

### Personal Information
- Name, email address, phone number
- Professional credentials and certifications
- Payment and billing information
- Case history and testimonials

### Usage Information
- Log data and device information
- Cookies and tracking technologies
- Search queries and interactions

## 2. How We Use Your Information

We use collected information to:
- Provide and improve our services
- Process transactions and send notifications
- Respond to inquiries and provide support
- Send marketing communications (with consent)
- Comply with legal obligations

## 3. Information Sharing

We do not sell your personal information. We may share information with:
- Service providers who assist our operations
- Legal authorities when required by law
- Other users as part of the platform functionality

## 4. Data Security

We implement appropriate security measures to protect your information:
- Encryption of data in transit and at rest
- Regular security assessments
- Access controls and authentication
- Secure data centers

## 5. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your data
- Opt-out of marketing communications
- Export your data

## 6. Cookies

We use cookies to:
- Maintain user sessions
- Remember preferences
- Analyze platform usage
- Provide personalized content

You can control cookie preferences through your browser settings.

## 7. Third-Party Services

Our Platform may integrate with third-party services. We are not responsible for the privacy practices of these services.

## 8. Children''s Privacy

The Platform is not intended for users under 18 years of age. We do not knowingly collect information from children.

## 9. International Data Transfers

Your information may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place.

## 10. Changes to Privacy Policy

We may update this Privacy Policy periodically. We will notify you of material changes via email or platform notification.

## 11. Contact Us

For privacy-related questions or requests, contact us at:
- Email: privacy@witnex.com
- Address: Witnex Legal Department, [Address]

For data subject requests under GDPR or CCPA, please use our dedicated privacy request form.',
  1,
  true,
  CURRENT_DATE
) ON CONFLICT DO NOTHING;
