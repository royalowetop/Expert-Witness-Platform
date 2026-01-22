import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface CaseEntry {
  case_name: string;
  case_year: string;
  side_represented: string;
  case_type: string;
  transcript_url: string;
  description: string;
}

export default function ExpertSignup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialization: '',
    years_of_experience: '',
    excluded_from_testifying: false,
    exclusion_details: ''
  });

  const [documents, setDocuments] = useState({
    license: null as File | null,
    transcript: null as File | null,
    cv: null as File | null,
    board_certification: null as File | null
  });

  const [cases, setCases] = useState<CaseEntry[]>([
    {
      case_name: '',
      case_year: '',
      side_represented: '',
      case_type: '',
      transcript_url: '',
      description: ''
    }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof typeof documents) => {
    const file = e.target.files?.[0] || null;
    setDocuments({ ...documents, [docType]: file });
  };

  const handleCaseChange = (index: number, field: keyof CaseEntry, value: string) => {
    const updatedCases = [...cases];
    updatedCases[index][field] = value;
    setCases(updatedCases);
  };

  const addCase = () => {
    setCases([
      ...cases,
      {
        case_name: '',
        case_year: '',
        side_represented: '',
        case_type: '',
        transcript_url: '',
        description: ''
      }
    ]);
  };

  const removeCase = (index: number) => {
    if (cases.length > 1) {
      setCases(cases.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { data: applicationData, error: applicationError } = await supabase
        .from('expert_applications')
        .insert([
          {
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            specialization: formData.specialization,
            years_of_experience: parseInt(formData.years_of_experience),
            excluded_from_testifying: formData.excluded_from_testifying,
            exclusion_details: formData.excluded_from_testifying ? formData.exclusion_details : null,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (applicationError) throw applicationError;

      const applicationId = applicationData.id;

      const documentEntries = [];
      for (const [docType, file] of Object.entries(documents)) {
        if (file) {
          documentEntries.push({
            application_id: applicationId,
            document_type: docType,
            file_name: file.name,
            file_path: `/uploads/${applicationId}/${file.name}`,
            file_size: file.size
          });
        }
      }

      if (documentEntries.length > 0) {
        const { error: docsError } = await supabase
          .from('expert_documents')
          .insert(documentEntries);

        if (docsError) throw docsError;
      }

      const caseEntries = cases
        .filter(c => c.case_name && c.case_year && c.side_represented && c.case_type)
        .map(c => ({
          application_id: applicationId,
          case_name: c.case_name,
          case_year: parseInt(c.case_year),
          side_represented: c.side_represented,
          case_type: c.case_type,
          transcript_url: c.transcript_url || null,
          description: c.description || null
        }));

      if (caseEntries.length > 0) {
        const { error: casesError } = await supabase
          .from('expert_cases')
          .insert(caseEntries);

        if (casesError) throw casesError;
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lift p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-check text-green-600 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-navy mb-4">Application Submitted Successfully!</h1>
          <p className="text-lg text-brand-slate mb-2">Thank you for applying to join Witnex as an expert witness.</p>
          <p className="text-brand-slate mb-8">Your application is currently <span className="font-semibold text-brand-gold">pending review</span>. Our verification team will review your credentials and contact you within 3-5 business days.</p>
          <div className="bg-brand-gold bg-opacity-10 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-brand-navy mb-2">What happens next?</h3>
            <ul className="text-left text-brand-slate space-y-2">
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-brand-gold mt-1 mr-2"></i>
                <span>Our team will verify your credentials and documents</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-brand-gold mt-1 mr-2"></i>
                <span>We'll review your case history and experience</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-brand-gold mt-1 mr-2"></i>
                <span>You'll receive an email with next steps</span>
              </li>
            </ul>
          </div>
          <Link to="/" className="inline-block bg-brand-navy text-white px-8 py-3 rounded-lg hover:bg-brand-charcoal transition-all duration-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
              <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Log In</Link>
              <Link to="/signup" className="bg-brand-navy text-white px-6 py-2 rounded-lg shadow-sm hover:bg-brand-charcoal transition-all duration-300">Attorney Sign Up</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-brand-navy">Become an Expert Witness</h1>
            <p className="mt-4 text-lg text-brand-slate">Join our network of verified expert witnesses</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step ? 'bg-brand-gold text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`w-16 h-1 ${s < step ? 'bg-brand-gold' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-2xl mx-auto mt-2 px-5">
              <span className="text-xs text-brand-slate">Basic Info</span>
              <span className="text-xs text-brand-slate">Documents</span>
              <span className="text-xs text-brand-slate">Background</span>
              <span className="text-xs text-brand-slate">Cases</span>
            </div>
          </div>

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-exclamation-circle text-red-600"></i>
                <p className="text-red-800 font-medium">Error: {errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-12">
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Basic Information</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-semibold text-brand-navy mb-2">Full Legal Name *</label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-brand-navy mb-2">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                        placeholder="jane@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-brand-navy mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-semibold text-brand-navy mb-2">Area of Specialization *</label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                      placeholder="e.g., Orthopedic Surgery, Forensic Accounting, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="years_of_experience" className="block text-sm font-semibold text-brand-navy mb-2">Years of Professional Experience *</label>
                    <input
                      type="number"
                      id="years_of_experience"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors duration-300"
                  >
                    Next Step <i className="fa-solid fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-12">
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Upload Documents</h2>
                <p className="text-brand-slate mb-6">Please upload the following documents to verify your credentials</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-2">License/Certification *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-gold transition-colors">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'license')}
                        className="hidden"
                        id="license"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="license" className="cursor-pointer">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-brand-gold mb-2"></i>
                        <p className="text-brand-navy font-medium">
                          {documents.license ? documents.license.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-brand-slate mt-1">PDF, JPG, or PNG (max 10MB)</p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-2">College Transcript *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-gold transition-colors">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'transcript')}
                        className="hidden"
                        id="transcript"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="transcript" className="cursor-pointer">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-brand-gold mb-2"></i>
                        <p className="text-brand-navy font-medium">
                          {documents.transcript ? documents.transcript.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-brand-slate mt-1">PDF, JPG, or PNG (max 10MB)</p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-2">CV/Resume *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-gold transition-colors">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'cv')}
                        className="hidden"
                        id="cv"
                        accept=".pdf,.doc,.docx"
                      />
                      <label htmlFor="cv" className="cursor-pointer">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-brand-gold mb-2"></i>
                        <p className="text-brand-navy font-medium">
                          {documents.cv ? documents.cv.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-brand-slate mt-1">PDF or DOC (max 10MB)</p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-2">Board Certifications (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-gold transition-colors">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'board_certification')}
                        className="hidden"
                        id="board_certification"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="board_certification" className="cursor-pointer">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-brand-gold mb-2"></i>
                        <p className="text-brand-navy font-medium">
                          {documents.board_certification ? documents.board_certification.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-brand-slate mt-1">PDF, JPG, or PNG (max 10MB)</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-brand-charcoal font-semibold px-8 py-3 rounded-lg hover:text-brand-gold transition-colors duration-300"
                  >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors duration-300"
                  >
                    Next Step <i className="fa-solid fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-12">
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Background Check</h2>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-brand-navy mb-2">Exclusion History</h3>
                    <p className="text-brand-slate text-sm mb-4">Please answer honestly. This information is used for verification purposes only.</p>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="excluded_from_testifying"
                        name="excluded_from_testifying"
                        checked={formData.excluded_from_testifying}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                      />
                      <label htmlFor="excluded_from_testifying" className="text-brand-navy font-medium">
                        I have been excluded from testifying as an expert witness by a judge in the past
                      </label>
                    </div>
                  </div>

                  {formData.excluded_from_testifying && (
                    <div>
                      <label htmlFor="exclusion_details" className="block text-sm font-semibold text-brand-navy mb-2">
                        Please provide details about the exclusion *
                      </label>
                      <textarea
                        id="exclusion_details"
                        name="exclusion_details"
                        value={formData.exclusion_details}
                        onChange={handleChange}
                        required={formData.excluded_from_testifying}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200 resize-none"
                        placeholder="Please describe the circumstances of the exclusion, including the case name, year, jurisdiction, and reasons given by the judge..."
                      ></textarea>
                      <p className="text-sm text-brand-slate mt-2">This information will be reviewed confidentially by our verification team.</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-brand-charcoal font-semibold px-8 py-3 rounded-lg hover:text-brand-gold transition-colors duration-300"
                  >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors duration-300"
                  >
                    Next Step <i className="fa-solid fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-12">
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Past Case Experience</h2>
                <p className="text-brand-slate mb-6">List your previous cases where you served as an expert witness</p>

                <div className="space-y-6">
                  {cases.map((caseEntry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-brand-navy">Case {index + 1}</h3>
                        {cases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCase(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            <i className="fa-solid fa-trash mr-1"></i> Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Case Name/Description *</label>
                          <input
                            type="text"
                            value={caseEntry.case_name}
                            onChange={(e) => handleCaseChange(index, 'case_name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                            placeholder="Smith v. Johnson"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-brand-navy mb-2">Year *</label>
                            <input
                              type="number"
                              value={caseEntry.case_year}
                              onChange={(e) => handleCaseChange(index, 'case_year', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                              placeholder="2023"
                              min="1900"
                              max={new Date().getFullYear()}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-brand-navy mb-2">Side Represented *</label>
                            <select
                              value={caseEntry.side_represented}
                              onChange={(e) => handleCaseChange(index, 'side_represented', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                            >
                              <option value="">Select...</option>
                              <option value="plaintiff">Plaintiff</option>
                              <option value="defense">Defense</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-brand-navy mb-2">Case Type *</label>
                            <input
                              type="text"
                              value={caseEntry.case_type}
                              onChange={(e) => handleCaseChange(index, 'case_type', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                              placeholder="Medical Malpractice"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Transcript URL (Optional)</label>
                          <input
                            type="url"
                            value={caseEntry.transcript_url}
                            onChange={(e) => handleCaseChange(index, 'transcript_url', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                            placeholder="https://example.com/transcript.pdf"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Brief Description (Optional)</label>
                          <textarea
                            value={caseEntry.description}
                            onChange={(e) => handleCaseChange(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200 resize-none"
                            placeholder="Briefly describe your role and contribution to this case..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCase}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-brand-charcoal hover:border-brand-gold hover:text-brand-gold transition-colors duration-300"
                  >
                    <i className="fa-solid fa-plus mr-2"></i> Add Another Case
                  </button>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-brand-charcoal font-semibold px-8 py-3 rounded-lg hover:text-brand-gold transition-colors duration-300"
                  >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane mr-2"></i>
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      <footer className="bg-brand-navy text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-gavel text-white text-2xl"></i>
                <span className="text-2xl font-serif font-bold">Witnex</span>
              </div>
              <p className="mt-4 text-brand-gray-medium max-w-md">The premier platform for connecting legal professionals with world-class expert witnesses.</p>
            </div>
            <div>
              <h4 className="font-semibold tracking-wider uppercase">Platform</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="/signup" className="text-brand-gray-medium hover:text-white transition-colors">Find an Expert</a></li>
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">For Law Firms</a></li>
                <li><a href="/expert-signup" className="text-brand-gray-medium hover:text-white transition-colors">For Experts</a></li>
                <li><a href="/pricing" className="text-brand-gray-medium hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold tracking-wider uppercase">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="text-brand-gray-medium hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-brand-slate pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-brand-gray-medium text-sm">&copy; 2026 Witnex. All Rights Reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-facebook-f"></i></a>
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="/terms-of-service" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Terms of Service</a>
              <span className="text-brand-gray-medium">•</span>
              <a href="/privacy-policy" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
