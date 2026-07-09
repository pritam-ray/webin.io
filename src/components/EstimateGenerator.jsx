import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Printer, RefreshCw, FileJson, 
  DollarSign, CheckCircle2, Building2, ShieldCheck, 
  Layers, ArrowLeft, Download, PlusCircle, Settings,
  Check, X, Sparkles
} from 'lucide-react';
import './EstimateGenerator.css';

// Standard template options
const DIRECT_PRESETS = {
  starter: {
    title: "Starter Website Package",
    description: "Design and development of a single-page high-converting responsive website.",
    items: [
      { id: '1', description: "Custom UI/UX Wireframe & Design (Figma)", price: 4000 },
      { id: '2', description: "Responsive Single Page Front-End Development (React)", price: 6000 },
      { id: '3', description: "Basic SEO Optimization & Google Analytics Integration", price: 2000 },
    ],
    milestones: [
      { id: 'm1', name: "Project Kickoff / Advance Payment", percentage: 40 },
      { id: 'm2', name: "Design Sign-off", percentage: 40 },
      { id: 'm3', name: "Final Handover & Launch", percentage: 20 },
    ]
  },
  professional: {
    title: "Professional Business Platform",
    description: "Complete multi-page website with dynamic cms integration, custom animations and professional SEO package.",
    items: [
      { id: '1', description: "Custom UI/UX Design for up to 8 pages (Figma)", price: 8000 },
      { id: '2', description: "Multi-page React/Vite Frontend with Framer Motion animations", price: 15000 },
      { id: '3', description: "CMS Integration (Sanity/Strapi) for blog & service management", price: 7000 },
      { id: '4', description: "On-Page SEO Strategy, WhatsApp Integration & Contact Forms", price: 5000 },
    ],
    milestones: [
      { id: 'm1', name: "Project Initiation (Advance)", percentage: 40 },
      { id: 'm2', name: "UI/UX Design Approval", percentage: 30 },
      { id: 'm3', name: "Development / Beta Launch", percentage: 25 },
      { id: 'm4', name: "Final Deployment & Support Handover", percentage: 5 },
    ]
  },
  enterprise: {
    title: "Enterprise Custom Platform",
    description: "Scalable custom web application including e-commerce system, administrative dashboard, and advanced features.",
    items: [
      { id: '1', description: "Detailed UX Discovery & Complete Wireframe Design Layouts", price: 20000 },
      { id: '2', description: "Custom React E-Commerce Storefront with secure payment gateway integrations", price: 30000 },
      { id: '3', description: "Advanced Admin Panel & Database Infrastructure (Node.js/PostgreSQL)", price: 20000 },
      { id: '4', description: "Quality Assurance Testing, Security Auditing, & Cloud Deployment (AWS)", price: 10000 },
      { id: '5', description: "3 Months Post-Launch Dedicated Support & Performance Optimization", price: 10000 },
    ],
    milestones: [
      { id: 'm1', name: "Project Commencement (Retainer)", percentage: 40 },
      { id: 'm2', name: "Detailed UX & Architecture Finalization", percentage: 20 },
      { id: 'm3', name: "Alpha Release (Frontend + Database Core)", percentage: 20 },
      { id: 'm4', name: "Beta Release (Staging & Payment gateway dry-run)", percentage: 15 },
      { id: 'm5', name: "Production Deployment & Launch Verification", percentage: 5 },
    ]
  }
};

const B2B_PRESETS = {
  development: {
    title: "Dedicated Front-End & QA Team Allocation",
    description: "Outsourced team resources for web application frontend modernization and unit testing cycles.",
    items: [
      { id: '1', role: "Senior Full-Stack Developer", rate: 2500, rateType: "hourly", units: 160 },
      { id: '2', role: "UI/UX Designer", rate: 2000, rateType: "hourly", units: 60 },
      { id: '3', role: "QA Engineer (Automation)", rate: 1500, rateType: "hourly", units: 40 },
    ]
  },
  fixedOutsource: {
    title: "Outsourced Module Development Contract",
    description: "Outsourced design and backend implementation of standard modular sub-systems.",
    items: [
      { id: '1', role: "Custom Integration & API Gateway Development", rate: 120000, rateType: "fixed", units: 1 },
      { id: '2', role: "Responsive Client Portal Frontend", rate: 150000, rateType: "fixed", units: 1 },
      { id: '3', role: "Database Migration & Setup", rate: 80000, rateType: "fixed", units: 1 },
    ]
  }
};

const INITIAL_PACKAGES_DATA = {
  starter: {
    name: 'Starter',
    price: '₹12,000',
    period: 'one-time',
    description: 'Perfect for small businesses and personal brands looking for a solid online presence.',
    features: [
      { text: 'Single Page Website', included: true },
      { text: 'Responsive Design', included: true },
      { text: 'Basic SEO Setup', included: true },
      { text: 'Contact Form', included: true },
      { text: 'Social Media Links', included: true },
      { text: '2 Revisions', included: true },
      { text: 'Custom Animations', included: false },
      { text: 'CMS Integration', included: false },
      { text: 'Priority Support', included: false },
    ],
    popular: false,
  },
  professional: {
    name: 'Professional',
    price: '₹35,000',
    period: 'one-time',
    description: 'For growing businesses that need a complete, conversion-optimized web presence.',
    features: [
      { text: 'Multi-Page Website (up to 8)', included: true },
      { text: 'Responsive Design', included: true },
      { text: 'Advanced SEO', included: true },
      { text: 'Contact Form + WhatsApp', included: true },
      { text: 'Custom Animations', included: true },
      { text: 'CMS Integration', included: true },
      { text: '5 Revisions', included: true },
      { text: '1 Month Free Support', included: true },
      { text: 'E-Commerce', included: false },
    ],
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: "let's talk",
    description: 'Full-scale digital platforms with custom features, e-commerce, and dedicated support.',
    features: [
      { text: 'Unlimited Pages', included: true },
      { text: 'Responsive Design', included: true },
      { text: 'Complete SEO Strategy', included: true },
      { text: 'E-Commerce Integration', included: true },
      { text: 'Admin Dashboard', included: true },
      { text: 'Custom Animations & 3D', included: true },
      { text: 'Unlimited Revisions', included: true },
      { text: '3 Months Free Support', included: true },
      { text: 'Priority Support', included: true },
    ],
    popular: false,
  }
};

const EstimateGenerator = () => {
  const [estimateMode, setEstimateMode] = useState('direct'); // 'direct' | 'b2b' | 'packages'
  const [currency, setCurrency] = useState('INR'); // INR, USD, EUR
  const [taxRate, setTaxRate] = useState(18); // Default 18% (GST)
  const [discountRate, setDiscountRate] = useState(0); // Custom discount %
  
  // General Info
  const [estimateId, setEstimateId] = useState('');
  const [date, setDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [projectTitle, setProjectTitle] = useState('Web Platform Development');
  const [projectDescription, setProjectDescription] = useState('Design and development of a modern digital experience according to specifications.');
  
  // Direct Client Info
  const [clientName, setClientName] = useState('John Doe');
  const [clientCompany, setClientCompany] = useState('Acme Technologies');
  const [clientEmail, setClientEmail] = useState('john@acme.com');
  const [directItems, setDirectItems] = useState(DIRECT_PRESETS.professional.items);
  const [milestones, setMilestones] = useState(DIRECT_PRESETS.professional.milestones);
  const [directTerms, setDirectTerms] = useState([
    "Scope of work is strictly limited to the line items detailed above. Any requirements outside this scope will require a fresh assessment and a change request order.",
    "Up to 3 rounds of revisions are included during the UI/UX design phase. Further iterations will be billed at an hourly rate of ₹2,000/hour.",
    "Hosting, domain registration, SSL certificates, and premium third-party API keys are to be procured by the client or will be billed at actual cost.",
    "Complete copyright and intellectual property rights will transfer to the client upon full and final settlement of all outstanding invoices.",
    "Includes 30 days of complimentary post-launch bug support. Regular maintenance, plugin updates, or feature additions after this period require a signed Retainer Agreement."
  ]);

  // B2B Software Agency Info
  const [partnerName, setPartnerName] = useState('TechScale Solutions');
  const [partnerContact, setPartnerContact] = useState('Sarah Connor');
  const [partnerEmail, setPartnerEmail] = useState('sarah@techscale.com');
  const [b2bItems, setB2bItems] = useState(B2B_PRESETS.development.items);
  const [whiteLabelTerms, setWhiteLabelTerms] = useState(
    "webing.io will deliver all services under a complete white-label format. All project assets, source repositories, documentation, and metadata will exclude webing.io branding. Any direct client meetings will be conducted under the partner's agency brand name using partner-provided communications channels."
  );
  const [nonSolicitTerms, setNonSolicitTerms] = useState(
    "webing.io commits to a strict non-solicitation agreement. webing.io will not directly or indirectly contact, market to, solicit, or contract with the end-client of TechScale Solutions during the term of this engagement and for a period of 24 months after completion."
  );
  const [ipTerms, setIpTerms] = useState(
    "All intellectual property, proprietary tools, and custom code written for this project will be transferred directly to the Partner Agency upon clearance of payment for the corresponding project module or milestone."
  );
  const [slaTerms, setSlaTerms] = useState(
    "webing.io provides dedicated developer SLA response guidelines: Critical production issues (Severity 1) resolved within 12 hours. General bug fixes (Severity 2) resolved within 48 hours. Standard communication channels include Slack/Teams with daily or weekly updates."
  );
  const [customB2bTerms, setCustomB2bTerms] = useState([
    "Resource billing is calculated on actual hours logged via Clockify/Toggl on a weekly sheet, approved by the partner's PM.",
    "Payments are due on Net 15 basis from invoice date. Invoices will be raised fortnightly.",
    "Either party may terminate the resource allocation with a 15-day written notice."
  ]);

  // Package Brochure Info
  const [packagesData, setPackagesData] = useState(INITIAL_PACKAGES_DATA);
  const [selectedEditPackage, setSelectedEditPackage] = useState('starter'); // 'starter' | 'professional' | 'enterprise'
  const [packagesTitle, setPackagesTitle] = useState("Transparent Pricing, Zero Surprises");
  const [packagesSubtitle, setPackagesSubtitle] = useState("Choose the plan that fits your needs. Every plan includes our signature design quality and attention to detail.");
  const [packagesTerms, setPackagesTerms] = useState([
    "Every plan includes responsive layout setups configured for Mobile, Tablet, and Desktop viewport sizes.",
    "Revisions processes commence post wireframe design and interface layouts approvals.",
    "Standard cloud hosting and administrative platform domain configs are to be procured separately by clients.",
    "Bespoke database or custom security models are scoped individually inside Custom Enterprise platforms."
  ]);

  // Initialize auto ID and dates on mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30);
    const formattedExpiry = expiry.toISOString().split('T')[0];
    
    setDate(formattedDate);
    setValidUntil(formattedExpiry);
    
    const randomNum = Math.floor(100 + Math.random() * 900);
    setEstimateId(`NX-${today.getFullYear()}-${randomNum}`);

    // Parse mode from URL parameters
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam && ['direct', 'b2b', 'packages'].includes(modeParam)) {
      setEstimateMode(modeParam);
    }
  }, []);

  // Currencies config
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || '₹';

  // Math Calculations
  const getSubtotal = () => {
    if (estimateMode === 'direct') {
      return directItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    } else if (estimateMode === 'b2b') {
      return b2bItems.reduce((sum, item) => {
        const rate = parseFloat(item.rate) || 0;
        const units = parseFloat(item.units) || 0;
        return sum + (rate * units);
      }, 0);
    }
    return 0;
  };

  const subtotal = getSubtotal();
  const discountAmount = subtotal * (discountRate / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const taxAmount = totalAfterDiscount * (taxRate / 100);
  const grandTotal = totalAfterDiscount + taxAmount;

  // Preset loaders
  const loadDirectPreset = (presetName) => {
    const preset = DIRECT_PRESETS[presetName];
    if (preset) {
      setProjectTitle(preset.title);
      setProjectDescription(preset.description);
      setDirectItems([...preset.items]);
      setMilestones([...preset.milestones]);
    }
  };

  const loadB2bPreset = (presetName) => {
    const preset = B2B_PRESETS[presetName];
    if (preset) {
      setProjectTitle(preset.title);
      setProjectDescription(preset.description);
      setB2bItems([...preset.items]);
    }
  };

  const resetPackagesToDefault = () => {
    if (window.confirm("Are you sure you want to reset packages to default webing.io rates?")) {
      setPackagesData(JSON.parse(JSON.stringify(INITIAL_PACKAGES_DATA)));
    }
  };

  // Direct Item updates
  const updateDirectItem = (id, field, value) => {
    setDirectItems(prev => prev.map(item => {
      if (item.id === id) {
        let parsed = value;
        if (field === 'price') parsed = parseFloat(value) || 0;
        return { ...item, [field]: parsed };
      }
      return item;
    }));
  };

  const addDirectItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: "New scope item description",
      price: 5000
    };
    setDirectItems(prev => [...prev, newItem]);
  };

  const deleteDirectItem = (id) => {
    if (directItems.length <= 1) return;
    setDirectItems(prev => prev.filter(item => item.id !== id));
  };

  // B2B Item updates
  const updateB2bItem = (id, field, value) => {
    setB2bItems(prev => prev.map(item => {
      if (item.id === id) {
        let parsed = value;
        if (field === 'rate' || field === 'units') parsed = parseFloat(value) || 0;
        return { ...item, [field]: parsed };
      }
      return item;
    }));
  };

  const addB2bItem = () => {
    const newItem = {
      id: Date.now().toString(),
      role: "Software Developer",
      rate: 2000,
      rateType: "hourly",
      units: 80
    };
    setB2bItems(prev => [...prev, newItem]);
  };

  const deleteB2bItem = (id) => {
    if (b2bItems.length <= 1) return;
    setB2bItems(prev => prev.filter(item => item.id !== id));
  };

  // Milestones updates
  const updateMilestone = (id, field, value) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        let parsed = value;
        if (field === 'percentage') parsed = parseFloat(value) || 0;
        return { ...m, [field]: parsed };
      }
      return m;
    }));
  };

  const addMilestone = () => {
    const totalCurrentPercent = milestones.reduce((sum, m) => sum + m.percentage, 0);
    const remaining = Math.max(0, 100 - totalCurrentPercent);
    const newMilestone = {
      id: Date.now().toString(),
      name: "New Milestone Phase",
      percentage: remaining
    };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const deleteMilestone = (id) => {
    if (milestones.length <= 1) return;
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const totalMilestonePercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);

  // Terms array updates
  const updateTerm = (index, value, listType) => {
    if (listType === 'direct') {
      setDirectTerms(prev => {
        const copy = [...prev];
        copy[index] = value;
        return copy;
      });
    } else if (listType === 'b2b') {
      setCustomB2bTerms(prev => {
        const copy = [...prev];
        copy[index] = value;
        return copy;
      });
    } else {
      setPackagesTerms(prev => {
        const copy = [...prev];
        copy[index] = value;
        return copy;
      });
    }
  };

  const addTerm = (listType) => {
    if (listType === 'direct') {
      setDirectTerms(prev => [...prev, "New contractual term or condition clause."]);
    } else if (listType === 'b2b') {
      setCustomB2bTerms(prev => [...prev, "New B2B contract term or resource guideline clause."]);
    } else {
      setPackagesTerms(prev => [...prev, "New standard packages clause or guideline."]);
    }
  };

  const deleteTerm = (index, listType) => {
    if (listType === 'direct') {
      setDirectTerms(prev => prev.filter((_, i) => i !== index));
    } else if (listType === 'b2b') {
      setCustomB2bTerms(prev => prev.filter((_, i) => i !== index));
    } else {
      setPackagesTerms(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Packages modifications
  const updatePackageField = (pkgKey, field, value) => {
    setPackagesData(prev => ({
      ...prev,
      [pkgKey]: {
        ...prev[pkgKey],
        [field]: value
      }
    }));
  };

  const updatePackageFeature = (pkgKey, featureIdx, field, value) => {
    setPackagesData(prev => {
      const features = [...prev[pkgKey].features];
      features[featureIdx] = {
        ...features[featureIdx],
        [field]: value
      };
      return {
        ...prev,
        [pkgKey]: {
          ...prev[pkgKey],
          features
        }
      };
    });
  };

  const addPackageFeature = (pkgKey) => {
    setPackagesData(prev => {
      const features = [...prev[pkgKey].features, { text: "New Package Feature", included: true }];
      return {
        ...prev,
        [pkgKey]: {
          ...prev[pkgKey],
          features
        }
      };
    });
  };

  const deletePackageFeature = (pkgKey, featureIdx) => {
    setPackagesData(prev => {
      const features = prev[pkgKey].features.filter((_, i) => i !== featureIdx);
      return {
        ...prev,
        [pkgKey]: {
          ...prev[pkgKey],
          features
        }
      };
    });
  };

  // Export/Import JSON files (useful function)
  const exportDataJSON = () => {
    const data = {
      estimateMode, currency, taxRate, discountRate, estimateId, date, validUntil,
      projectTitle, projectDescription,
      direct: { clientName, clientCompany, clientEmail, items: directItems, milestones, terms: directTerms },
      b2b: { partnerName, partnerContact, partnerEmail, items: b2bItems, whiteLabelTerms, nonSolicitTerms, ipTerms, slaTerms, customB2bTerms },
      packages: { packagesTitle, packagesSubtitle, packagesData, terms: packagesTerms }
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Webing_Estimate_${estimateId || 'Draft'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.estimateMode) setEstimateMode(parsed.estimateMode);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
        if (parsed.discountRate !== undefined) setDiscountRate(parsed.discountRate);
        if (parsed.estimateId) setEstimateId(parsed.estimateId);
        if (parsed.date) setDate(parsed.date);
        if (parsed.validUntil) setValidUntil(parsed.validUntil);
        if (parsed.projectTitle) setProjectTitle(parsed.projectTitle);
        if (parsed.projectDescription) setProjectDescription(parsed.projectDescription);
        
        if (parsed.direct) {
          if (parsed.direct.clientName) setClientName(parsed.direct.clientName);
          if (parsed.direct.clientCompany) setClientCompany(parsed.direct.clientCompany);
          if (parsed.direct.clientEmail) setClientEmail(parsed.direct.clientEmail);
          if (parsed.direct.items) setDirectItems(parsed.direct.items);
          if (parsed.direct.milestones) setMilestones(parsed.direct.milestones);
          if (parsed.direct.terms) setDirectTerms(parsed.direct.terms);
        }

        if (parsed.b2b) {
          if (parsed.b2b.partnerName) setPartnerName(parsed.b2b.partnerName);
          if (parsed.b2b.partnerContact) setPartnerContact(parsed.b2b.partnerContact);
          if (parsed.b2b.partnerEmail) setPartnerEmail(parsed.b2b.partnerEmail);
          if (parsed.b2b.items) setB2bItems(parsed.b2b.items);
          if (parsed.b2b.whiteLabelTerms) setWhiteLabelTerms(parsed.b2b.whiteLabelTerms);
          if (parsed.b2b.nonSolicitTerms) setNonSolicitTerms(parsed.b2b.nonSolicitTerms);
          if (parsed.b2b.ipTerms) setIpTerms(parsed.b2b.ipTerms);
          if (parsed.b2b.slaTerms) setSlaTerms(parsed.b2b.slaTerms);
          if (parsed.b2b.customB2bTerms) setCustomB2bTerms(parsed.b2b.customB2bTerms);
        }

        if (parsed.packages) {
          if (parsed.packages.packagesTitle) setPackagesTitle(parsed.packages.packagesTitle);
          if (parsed.packages.packagesSubtitle) setPackagesSubtitle(parsed.packages.packagesSubtitle);
          if (parsed.packages.packagesData) setPackagesData(parsed.packages.packagesData);
          if (parsed.packages.terms) setPackagesTerms(parsed.packages.terms);
        }
      } catch (err) {
        alert("Failed to parse estimate file. Please ensure it is a valid JSON template.");
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="est-wrapper">
      {/* Top Banner & Mode Selector (Hidden in Print) */}
      <div className="est-control-panel-header no-print">
        <div className="est-header-left">
          <a href="/" className="est-back-link">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </a>
          <h2 className="est-gradient-title">Estimate Generator</h2>
        </div>
        <div className="est-header-actions">
          <label className="est-import-btn">
            <FileJson size={16} />
            <span>Load JSON Template</span>
            <input type="file" accept=".json" onChange={importDataJSON} style={{ display: 'none' }} />
          </label>
          <button className="est-action-btn sec" onClick={exportDataJSON}>
            <Download size={16} />
            <span>Backup Draft</span>
          </button>
          <button className="est-action-btn primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Generate & Download PDF</span>
          </button>
        </div>
      </div>

      <div className="est-dashboard">
        
        {/* Left Side: Editor Section (Hidden in Print) */}
        <div className="est-editor-column no-print">
          
          {/* Main Controls Panel */}
          <div className="est-editor-card">
            <h3 className="est-card-title"><Settings size={18} /> Document Options</h3>
            <div className="est-mode-selector">
              <button 
                className={`est-mode-tab ${estimateMode === 'direct' ? 'active' : ''}`}
                onClick={() => setEstimateMode('direct')}
              >
                <CheckCircle2 size={16} />
                <span>Direct Client</span>
              </button>
              <button 
                className={`est-mode-tab ${estimateMode === 'b2b' ? 'active' : ''}`}
                onClick={() => setEstimateMode('b2b')}
              >
                <Building2 size={16} />
                <span>Software B2B</span>
              </button>
              <button 
                className={`est-mode-tab ${estimateMode === 'packages' ? 'active' : ''}`}
                onClick={() => setEstimateMode('packages')}
              >
                <Layers size={16} />
                <span>Pricing Packages</span>
              </button>
            </div>

            <div className="est-grid-2">
              <div className="est-input-group">
                <label>Reference ID</label>
                <input type="text" value={estimateId} onChange={(e) => setEstimateId(e.target.value)} />
              </div>
              <div className="est-input-group">
                <label>Billing Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="est-grid-2">
              <div className="est-input-group">
                <label>Creation Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="est-input-group">
                <label>Validity Date</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>

            {estimateMode !== 'packages' && (
              <div className="est-grid-2">
                <div className="est-input-group">
                  <label>Taxes Rate (%)</label>
                  <input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="est-input-group">
                  <label>Discount Rate (%)</label>
                  <input type="number" min="0" max="100" value={discountRate} onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            )}
          </div>

          {/* Preset templates for Direct / B2B, or Reset for Packages */}
          {estimateMode === 'packages' ? (
            <div className="est-editor-card">
              <h3 className="est-card-title"><RefreshCw size={18} /> Reset Options</h3>
              <button className="est-action-btn sec" onClick={resetPackagesToDefault} style={{ width: '100%' }}>
                Reset Packages to Default Rates
              </button>
            </div>
          ) : (
            <div className="est-editor-card">
              <h3 className="est-card-title"><Layers size={18} /> Load Starter Presets</h3>
              {estimateMode === 'direct' ? (
                <div className="est-preset-buttons">
                  <button onClick={() => loadDirectPreset('starter')}>Starter Pack (₹15K)</button>
                  <button onClick={() => loadDirectPreset('professional')}>Professional (₹40K)</button>
                  <button onClick={() => loadDirectPreset('enterprise')}>Enterprise App (Custom)</button>
                </div>
              ) : (
                <div className="est-preset-buttons">
                  <button onClick={() => loadB2bPreset('development')}>Hourly Outsource Allocation</button>
                  <button onClick={() => loadB2bPreset('fixedOutsource')}>Fixed Module Outsource</button>
                </div>
              )}
            </div>
          )}

          {/* Client Info (Rendered for all modes, optional for packages brochure) */}
          <div className="est-editor-card">
            <h3 className="est-card-title">
              {estimateMode === 'packages' ? <Building2 size={18} /> : estimateMode === 'b2b' ? <Building2 size={18} /> : <CheckCircle2 size={18} />}
              {estimateMode === 'packages' ? "Client Target Details (Optional)" : estimateMode === 'b2b' ? "Partner Agency Information" : "Direct Client Information"}
            </h3>
            {estimateMode === 'b2b' ? (
              <>
                <div className="est-input-group">
                  <label>Partner Company Name</label>
                  <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
                </div>
                <div className="est-input-group">
                  <label>Partner Representative</label>
                  <input type="text" value={partnerContact} onChange={(e) => setPartnerContact(e.target.value)} />
                </div>
                <div className="est-input-group">
                  <label>Partner Email</label>
                  <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="est-input-group">
                  <label>Client Contact Name</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="est-input-group">
                  <label>Client Company Name</label>
                  <input type="text" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
                </div>
                <div className="est-input-group">
                  <label>Client Email Address</label>
                  <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
              </>
            )}
          </div>

          {/* Conditional Editors: Items vs Packages */}
          {estimateMode === 'packages' ? (
            <>
              {/* Packages Specific Editor */}
              <div className="est-editor-card">
                <h3 className="est-card-title"><Layers size={18} /> Edit Pricing Packages</h3>
                
                <div className="est-input-group">
                  <label>Brochure Main Title</label>
                  <input type="text" value={packagesTitle} onChange={(e) => setPackagesTitle(e.target.value)} />
                </div>
                <div className="est-input-group">
                  <label>Brochure Subtitle / Motto</label>
                  <textarea rows={2} value={packagesSubtitle} onChange={(e) => setPackagesSubtitle(e.target.value)} />
                </div>

                <div className="est-divider-line" style={{ margin: '1.5rem 0' }} />

                <div className="est-input-group">
                  <label>Select Package to Customize</label>
                  <div className="est-preset-buttons">
                    <button 
                      className={selectedEditPackage === 'starter' ? 'active-preset' : ''}
                      onClick={() => setSelectedEditPackage('starter')}
                      style={selectedEditPackage === 'starter' ? { borderColor: 'var(--accent-primary)', background: 'rgba(108,92,231,0.2)' } : {}}
                    >
                      Starter
                    </button>
                    <button 
                      className={selectedEditPackage === 'professional' ? 'active-preset' : ''}
                      onClick={() => setSelectedEditPackage('professional')}
                      style={selectedEditPackage === 'professional' ? { borderColor: 'var(--accent-primary)', background: 'rgba(108,92,231,0.2)' } : {}}
                    >
                      Professional
                    </button>
                    <button 
                      className={selectedEditPackage === 'enterprise' ? 'active-preset' : ''}
                      onClick={() => setSelectedEditPackage('enterprise')}
                      style={selectedEditPackage === 'enterprise' ? { borderColor: 'var(--accent-primary)', background: 'rgba(108,92,231,0.2)' } : {}}
                    >
                      Enterprise
                    </button>
                  </div>
                </div>

                <div className="est-grid-2" style={{ marginTop: '1rem' }}>
                  <div className="est-input-group">
                    <label>Package Name</label>
                    <input 
                      type="text" 
                      value={packagesData[selectedEditPackage].name} 
                      onChange={(e) => updatePackageField(selectedEditPackage, 'name', e.target.value)} 
                    />
                  </div>
                  <div className="est-input-group">
                    <label>Price</label>
                    <input 
                      type="text" 
                      value={packagesData[selectedEditPackage].price} 
                      onChange={(e) => updatePackageField(selectedEditPackage, 'price', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="est-grid-2">
                  <div className="est-input-group">
                    <label>Period (e.g. one-time)</label>
                    <input 
                      type="text" 
                      value={packagesData[selectedEditPackage].period} 
                      onChange={(e) => updatePackageField(selectedEditPackage, 'period', e.target.value)} 
                    />
                  </div>
                  <div className="est-input-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="pkg-popular-chk"
                      checked={packagesData[selectedEditPackage].popular} 
                      onChange={(e) => updatePackageField(selectedEditPackage, 'popular', e.target.checked)} 
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <label htmlFor="pkg-popular-chk" style={{ cursor: 'pointer', margin: 0 }}>Most Popular Badge</label>
                  </div>
                </div>

                <div className="est-input-group">
                  <label>Package Description</label>
                  <textarea 
                    rows={2} 
                    value={packagesData[selectedEditPackage].description} 
                    onChange={(e) => updatePackageField(selectedEditPackage, 'description', e.target.value)} 
                  />
                </div>

                <div className="est-card-header-flex" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-accent)' }}>Features List</h4>
                  <button className="est-add-item-btn" onClick={() => addPackageFeature(selectedEditPackage)}>
                    <Plus size={12} /> Add Feature
                  </button>
                </div>

                <div className="est-items-editor-list">
                  {packagesData[selectedEditPackage].features.map((feat, idx) => (
                    <div key={idx} className="est-item-row-edit" style={{ padding: '0.5rem 0.75rem' }}>
                      <input 
                        type="checkbox" 
                        checked={feat.included} 
                        onChange={(e) => updatePackageFeature(selectedEditPackage, idx, 'included', e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        value={feat.text} 
                        onChange={(e) => updatePackageFeature(selectedEditPackage, idx, 'text', e.target.value)}
                        placeholder="Feature Description"
                        style={{ border: 'none', background: 'transparent', padding: '0.25rem' }}
                      />
                      <button 
                        className="est-delete-row-btn" 
                        onClick={() => deletePackageFeature(selectedEditPackage, idx)}
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </>
          ) : (
            <>
              {/* Project Specs (Estimate Modes Only) */}
              <div className="est-editor-card">
                <h3 className="est-card-title"><FileText size={18} /> Project Specifications</h3>
                <div className="est-input-group">
                  <label>Project Title</label>
                  <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
                </div>
                <div className="est-input-group">
                  <label>Scope Overview</label>
                  <textarea rows={3} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
                </div>
              </div>

              {/* Line Items Editor (Estimate Modes Only) */}
              <div className="est-editor-card">
                <div className="est-card-header-flex">
                  <h3 className="est-card-title"><Layers size={18} /> Line Items & Pricing</h3>
                  <button 
                    className="est-add-item-btn" 
                    onClick={estimateMode === 'direct' ? addDirectItem : addB2bItem}
                  >
                    <Plus size={14} /> Add Line Item
                  </button>
                </div>

                {estimateMode === 'direct' ? (
                  <div className="est-items-editor-list">
                    {directItems.map((item, idx) => (
                      <div key={item.id} className="est-item-row-edit">
                        <div className="est-item-num-badge">{idx + 1}</div>
                        <div className="est-input-group est-col-desc">
                          <input 
                            type="text" 
                            placeholder="Item Description" 
                            value={item.description} 
                            onChange={(e) => updateDirectItem(item.id, 'description', e.target.value)} 
                          />
                        </div>
                        <div className="est-input-group est-col-price">
                          <div className="est-currency-input-wrapper">
                            <span>{symbol}</span>
                            <input 
                              type="number" 
                              placeholder="Price" 
                              value={item.price} 
                              onChange={(e) => updateDirectItem(item.id, 'price', e.target.value)} 
                            />
                          </div>
                        </div>
                        <button 
                          className="est-delete-row-btn" 
                          onClick={() => deleteDirectItem(item.id)}
                          disabled={directItems.length <= 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="est-items-editor-list">
                    {b2bItems.map((item, idx) => (
                      <div key={item.id} className="est-item-row-edit-b2b">
                        <div className="est-item-num-badge">{idx + 1}</div>
                        <div className="est-grid-b2b-controls">
                          <div className="est-input-group grid-c-role">
                            <label>Resource / Scope Module</label>
                            <input 
                              type="text" 
                              placeholder="Role" 
                              value={item.role} 
                              onChange={(e) => updateB2bItem(item.id, 'role', e.target.value)} 
                            />
                          </div>
                          <div className="est-input-group grid-c-rate">
                            <label>Rate ({symbol})</label>
                            <input 
                              type="number" 
                              value={item.rate} 
                              onChange={(e) => updateB2bItem(item.id, 'rate', e.target.value)} 
                            />
                          </div>
                          <div className="est-input-group grid-c-type">
                            <label>Type</label>
                            <select 
                              value={item.rateType} 
                              onChange={(e) => updateB2bItem(item.id, 'rateType', e.target.value)}
                            >
                              <option value="hourly">Hourly</option>
                              <option value="monthly">Monthly</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                          <div className="est-input-group grid-c-units">
                            <label>{item.rateType === 'hourly' ? 'Hours' : item.rateType === 'monthly' ? 'Months' : 'Qty'}</label>
                            <input 
                              type="number" 
                              value={item.units} 
                              onChange={(e) => updateB2bItem(item.id, 'units', e.target.value)} 
                            />
                          </div>
                        </div>
                        <button 
                          className="est-delete-row-btn" 
                          onClick={() => deleteB2bItem(item.id)}
                          disabled={b2bItems.length <= 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones Plan (Direct Mode Only) */}
              {estimateMode === 'direct' && (
                <div className="est-editor-card">
                  <div className="est-card-header-flex">
                    <h3 className="est-card-title"><DollarSign size={18} /> Milestone Payment Schedule</h3>
                    <button className="est-add-item-btn" onClick={addMilestone}>
                      <Plus size={14} /> Add Milestone
                    </button>
                  </div>

                  <div className="est-milestone-warnings">
                    {totalMilestonePercentage !== 100 ? (
                      <span className="est-warning-badge text-amber">
                        Total percentage is {totalMilestonePercentage}%. Make sure it equals 100%.
                      </span>
                    ) : (
                      <span className="est-warning-badge text-green">
                        ✓ Total percentage is 100%.
                      </span>
                    )}
                  </div>

                  <div className="est-items-editor-list">
                    {milestones.map((m) => (
                      <div key={m.id} className="est-item-row-edit">
                        <div className="est-input-group est-col-desc">
                          <input 
                            type="text" 
                            placeholder="Milestone Event Name" 
                            value={m.name} 
                            onChange={(e) => updateMilestone(m.id, 'name', e.target.value)} 
                          />
                        </div>
                        <div className="est-input-group est-col-percent">
                          <div className="est-percent-input-wrapper">
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              placeholder="%" 
                              value={m.percentage} 
                              onChange={(e) => updateMilestone(m.id, 'percentage', e.target.value)} 
                            />
                            <span>%</span>
                          </div>
                        </div>
                        <div className="est-milestone-amount-calc">
                          {symbol}{((grandTotal * m.percentage) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <button 
                          className="est-delete-row-btn" 
                          onClick={() => deleteMilestone(m.id)}
                          disabled={milestones.length <= 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* B2B Clauses (Tie-up Mode Only) */}
              {estimateMode === 'b2b' && (
                <div className="est-editor-card">
                  <h3 className="est-card-title"><ShieldCheck size={18} /> Partnership (B2B) Clauses</h3>
                  <div className="est-input-group">
                    <label>1. White-Label Delivery Terms</label>
                    <textarea rows={3} value={whiteLabelTerms} onChange={(e) => setWhiteLabelTerms(e.target.value)} />
                  </div>
                  <div className="est-input-group">
                    <label>2. Non-Solicitation & NDA</label>
                    <textarea rows={3} value={nonSolicitTerms} onChange={(e) => setNonSolicitTerms(e.target.value)} />
                  </div>
                  <div className="est-input-group">
                    <label>3. Intellectual Property Transfer</label>
                    <textarea rows={3} value={ipTerms} onChange={(e) => setIpTerms(e.target.value)} />
                  </div>
                  <div className="est-input-group">
                    <label>4. SLA & Delivery Commitments</label>
                    <textarea rows={3} value={slaTerms} onChange={(e) => setSlaTerms(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* General Terms & Conditions */}
          <div className="est-editor-card">
            <div className="est-card-header-flex">
              <h3 className="est-card-title"><ShieldCheck size={18} /> General Terms & Conditions</h3>
              <button 
                className="est-add-item-btn" 
                onClick={() => addTerm(estimateMode)}
              >
                <Plus size={14} /> Add Clause
              </button>
            </div>

            <div className="est-terms-editor-list">
              {(estimateMode === 'direct' ? directTerms : estimateMode === 'b2b' ? customB2bTerms : packagesTerms).map((term, index) => (
                <div key={index} className="est-term-row-edit">
                  <textarea 
                    rows={2} 
                    value={term} 
                    onChange={(e) => updateTerm(index, e.target.value, estimateMode)} 
                  />
                  <button 
                    className="est-delete-row-btn" 
                    onClick={() => deleteTerm(index, estimateMode)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Virtual A4 Document Preview Section */}
        <div className="est-preview-column">
          <div className="est-preview-sticky">
            <div className="est-preview-tip no-print">
              Live Printable A4 Document Preview. What you see matches the PDF export.
            </div>
            
            {/* The actual paper template that will be printed */}
            <div className={`est-paper-document printable-document ${estimateMode === 'packages' ? 'packages-brochure-sheet' : ''}`}>
              
              {/* Cover top accent border */}
              <div className="est-paper-header-accent" />

              {/* Document Header */}
              <div className="est-paper-header">
                <div className="est-p-header-left">
                  {/* webing.io Brand Logo */}
                  <div className="est-paper-logo" style={{ display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 100 100" width="28" height="28" style={{ marginRight: '6px', overflow: 'visible', display: 'inline-block' }}>
                      <defs>
                        <linearGradient id="est-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6c5ce7" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <linearGradient id="est-logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00d2ff" />
                          <stop offset="100%" stopColor="#0066ff" />
                        </linearGradient>
                        <filter id="est-logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      <circle cx="24" cy="26" r="6" fill="#00d2ff" />
                      <path d="M 25 38 L 38 62" stroke="url(#est-logo-grad-2)" strokeWidth="11" strokeLinecap="round" />
                      <path d="M 38 62 L 52 26" stroke="url(#est-logo-grad-1)" strokeWidth="11" strokeLinecap="round" filter="url(#est-logo-shadow)" />
                      <path d="M 52 26 L 66 62" stroke="url(#est-logo-grad-2)" strokeWidth="11" strokeLinecap="round" />
                      <path d="M 66 62 L 80 26" stroke="url(#est-logo-grad-1)" strokeWidth="11" strokeLinecap="round" filter="url(#est-logo-shadow)" />
                    </svg>
                    <span className="logo-text">webing</span>
                    <span className="logo-subtext">.io</span>
                  </div>
                  <p className="est-brand-motto">We build premium digital engines.</p>
                </div>
                <div className="est-p-header-right">
                  <h1 className="est-doc-type-heading">
                    {estimateMode === 'packages' ? 'SERVICES & PRICING PROPOSAL' : 'BUDGETARY ESTIMATE'}
                  </h1>
                  <table className="est-header-meta-table">
                    <tbody>
                      <tr>
                        <td>{estimateMode === 'packages' ? 'Proposal No:' : 'Estimate No:'}</td>
                        <th>{estimateId}</th>
                      </tr>
                      <tr>
                        <td>Date:</td>
                        <td>{date}</td>
                      </tr>
                      <tr>
                        <td>Valid Until:</td>
                        <td>{validUntil}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="est-divider-line" />

              {/* Vendor & Client Details Section */}
              <div className="est-parties-grid">
                <div className="est-party-box">
                  <h4 className="party-title">ESTIMATED BY</h4>
                  <p className="party-bold font-title">webing.io</p>
                  <p className="party-details">Enterprise Design & Development division</p>
                  <p className="party-details">Email: impritamray@gmail.com</p>
                </div>
                <div className="est-party-box text-right-aligned">
                  <h4 className="party-title">PREPARED FOR</h4>
                  {estimateMode === 'b2b' ? (
                    <>
                      <p className="party-bold">{partnerContact}</p>
                      <p className="party-details">{partnerName} (B2B Partner)</p>
                      <p className="party-details">Email: {partnerEmail}</p>
                    </>
                  ) : (
                    <>
                      <p className="party-bold">{clientName || 'Valued Client'}</p>
                      {clientCompany && <p className="party-details">{clientCompany}</p>}
                      {clientEmail && <p className="party-details">Email: {clientEmail}</p>}
                    </>
                  )}
                </div>
              </div>

              {/* Main Content Layout based on Mode */}
              {estimateMode === 'packages' ? (
                <>
                  {/* Pricing Packages Visual 3-Column Display */}
                  <div className="est-packages-brochure-content">
                    <div className="est-brochure-header">
                      <h2 className="est-brochure-title">{packagesTitle}</h2>
                      <p className="est-brochure-subtitle">{packagesSubtitle}</p>
                    </div>

                    <div className="est-brochure-cards-grid">
                      {Object.keys(packagesData).map((pkgKey) => {
                        const pkg = packagesData[pkgKey];
                        return (
                          <div key={pkgKey} className={`est-brochure-card ${pkg.popular ? 'popular' : ''}`}>
                            {pkg.popular && (
                              <div className="est-card-popular-badge">
                                <Sparkles size={11} />
                                <span>Most Popular</span>
                              </div>
                            )}
                            <div className="est-card-head">
                              <h3 className="est-card-pkg-name">{pkg.name}</h3>
                              <div className="est-card-pkg-price-row">
                                <span className="est-card-pkg-price">{pkg.price}</span>
                                <span className="est-card-pkg-period">{pkg.period}</span>
                              </div>
                              <p className="est-card-pkg-desc">{pkg.description}</p>
                            </div>
                            <div className="est-card-divider" />
                            <ul className="est-card-features-list">
                              {pkg.features.map((feat, fIdx) => (
                                <li key={fIdx} className={feat.included ? 'included' : 'excluded'}>
                                  {feat.included ? (
                                    <Check size={13} className="bullet-ico check-ico" />
                                  ) : (
                                    <X size={13} className="bullet-ico cross-ico" />
                                  )}
                                  <span>{feat.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Project Scope Description */}
                  <div className="est-project-overview-box">
                    <h4 className="est-section-title">PROJECT SPECIFICATIONS</h4>
                    <h3 className="est-project-preview-title">{projectTitle}</h3>
                    <p className="est-project-preview-desc">{projectDescription}</p>
                  </div>

                  {/* Main Scope Line Items Table */}
                  <div className="est-scope-section">
                    <h4 className="est-section-title">ESTIMATED INVESTMENT</h4>
                    {estimateMode === 'direct' ? (
                      <table className="est-data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '8%' }}>SL.</th>
                            <th>SERVICE DELIVERABLE & SCOPE DETAILS</th>
                            <th style={{ width: '25%', textAlign: 'right' }}>PRICE ({currency})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {directItems.map((item, idx) => (
                            <tr key={item.id}>
                              <td>{String(idx + 1).padStart(2, '0')}</td>
                              <td>
                                <span className="deliverable-text">{item.description}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {symbol}{(parseFloat(item.price) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="est-data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '8%' }}>SL.</th>
                            <th>RESOURCE ROLE / MODULE WORK</th>
                            <th style={{ width: '22%', textAlign: 'right' }}>BILLING RATE</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>ALLOCATION</th>
                            <th style={{ width: '22%', textAlign: 'right' }}>TOTAL ({currency})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {b2bItems.map((item, idx) => {
                            const r = parseFloat(item.rate) || 0;
                            const u = parseFloat(item.units) || 0;
                            const rateTypeLabel = item.rateType === 'hourly' ? '/hr' : item.rateType === 'monthly' ? '/mo' : ' Flat';
                            const unitsLabel = item.rateType === 'hourly' ? ' hrs' : item.rateType === 'monthly' ? ' mos' : ' qty';
                            return (
                              <tr key={item.id}>
                                <td>{String(idx + 1).padStart(2, '0')}</td>
                                <td>
                                  <span className="deliverable-text">{item.role}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  {symbol}{r.toLocaleString('en-IN')}{rateTypeLabel}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {u}{unitsLabel}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  {symbol}{(r * u).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Cost Summary calculations */}
                  <div className="est-financial-summary-grid">
                    <div className="est-financial-notes-left">
                      {estimateMode === 'b2b' && (
                        <div className="est-b2b-highlight-notes">
                          <div className="highlight-tag">B2B Software Vendor Terms</div>
                          <p>• White-label delivery model active</p>
                          <p>• Non-solicitation agreement in effect</p>
                          <p>• Intellectual Property transferred upon milestone completion</p>
                        </div>
                      )}
                    </div>
                    <div className="est-financial-calculations-right">
                      <table className="est-calculations-table">
                        <tbody>
                          <tr>
                            <td>Subtotal:</td>
                            <td>{symbol}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                          {discountRate > 0 && (
                            <tr>
                              <td>Discount ({discountRate}%):</td>
                              <td className="text-discount-minus">-{symbol}{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          )}
                          {taxRate > 0 && (
                            <tr>
                              <td>Taxes / GST ({taxRate}%):</td>
                              <td>{symbol}{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          )}
                          <tr className="grand-total-row">
                            <td>TOTAL ESTIMATE:</td>
                            <td>{symbol}{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Milestones (Direct Mode Only) */}
                  {estimateMode === 'direct' && (
                    <div className="est-preview-block-section">
                      <h4 className="est-section-title">PROPOSED PAYMENT MILESTONES</h4>
                      <table className="est-milestone-table">
                        <thead>
                          <tr>
                            <th>PHASE DESCRIPTION</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>PERCENTAGE</th>
                            <th style={{ width: '30%', textAlign: 'right' }}>DUE AMOUNT ({currency})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.map((m) => (
                            <tr key={m.id}>
                              <td>{m.name}</td>
                              <td style={{ textAlign: 'center' }}>{m.percentage}%</td>
                              <td style={{ textAlign: 'right' }}>
                                {symbol}{((grandTotal * m.percentage) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Clauses Section */}
              <div className="est-preview-block-section page-break-before-avoid">
                <h4 className="est-section-title">AGREEMENT & COVENANTS</h4>
                
                {estimateMode === 'b2b' && (
                  <div className="est-b2b-clauses-wrapper">
                    {whiteLabelTerms && (
                      <div className="est-clause-item">
                        <h5>1. WHITE-LABEL CONTRACTING</h5>
                        <p>{whiteLabelTerms}</p>
                      </div>
                    )}
                    {nonSolicitTerms && (
                      <div className="est-clause-item">
                        <h5>2. NDA & CLIENT NON-SOLICITATION</h5>
                        <p>{nonSolicitTerms}</p>
                      </div>
                    )}
                    {ipTerms && (
                      <div className="est-clause-item">
                        <h5>3. INTELLECTUAL PROPERTY & TRANSFER</h5>
                        <p>{ipTerms}</p>
                      </div>
                    )}
                    {slaTerms && (
                      <div className="est-clause-item">
                        <h5>4. SLA & ESCALATION COMMITMENTS</h5>
                        <p>{slaTerms}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="est-general-clauses-wrapper">
                  <h5>{estimateMode === 'b2b' ? '5. ADDITIONAL COVENANTS' : estimateMode === 'packages' ? 'TERMS & INCLUSIONS' : 'TERMS & CONDITIONS'}</h5>
                  <ol className="est-clause-ordered-list">
                    {(estimateMode === 'direct' ? directTerms : estimateMode === 'b2b' ? customB2bTerms : packagesTerms).map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="est-signatures-block page-break-inside-avoid">
                <div className="sig-column">
                  <p className="sig-company-label">For webing.io</p>
                  <div className="sig-line" />
                  <p className="sig-name">Authorized Signatory</p>
                  <p className="sig-date">Date: __________________</p>
                </div>
                <div className="sig-column text-right-aligned">
                  <p className="sig-company-label">
                    For {estimateMode === 'b2b' ? partnerName : (clientCompany || clientName || 'Client')}
                  </p>
                  <div className="sig-line" />
                  <p className="sig-name">Acceptance Signature / Stamp</p>
                  <p className="sig-date">Date: __________________</p>
                </div>
              </div>

              {/* Page Footer Note */}
              <div className="est-paper-footer-note">
                <p>Confidential Business Document. webing.io Private Limited.</p>
                <p>Generated electronically via Webing Estimate Engine.</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EstimateGenerator;
