const messages = {
  Metadata: {
    rootTitle: "RAG-Refine | LLM Data Cleanup",
    rootDescription:
      "Landing page for RAG-Refine, high-fidelity data ingestion for LLMs",
    dashboardTitle: "Dashboard — RAG-Refine",
    jobTitle: "{fileName} — RAG-Refine",
    jobTitleFallback: "Job — RAG-Refine",
  },

  Landing: {
    badge: "LLM-Optimized Infrastructure",
    heroTitle1: "Garbage In,",
    heroTitle2: "Garbage Out.",
    heroDescription:
      "Stop feeding your LLM noisy data. Convert messy PDFs, complex tables, and cluttered web docs into clean, structured Markdown ready for RAG.",
    getStarted: "Get Started",
    signIn: "Sign In",
    createAccount: "Create Account",
    taxTitle: "The Context Window Tax",
    taxDescription:
      "Messy data doesn't just lower LLM quality—it costs you tokens and developer time.",
    brokenTablesTitle: "Broken Tables",
    brokenTablesDesc:
      "Standard PDF parsers treat tables as raw text strings, causing hallucination spikes during retrieval.",
    pollutionTitle: "Document Pollution",
    pollutionDesc:
      "Headers, footers, and legal disclaimers fill your vector database with semantic noise.",
    burnoutTitle: "Engineer Burnout",
    burnoutDesc:
      "Engineers shouldn't spend 60% of their time writing custom regex for specific document formats.",
    tableRecoveryTitle: "Smart Table Recovery",
    tableRecoveryDesc:
      "Our proprietary OCR-to-JSON engine reconstructs multi-page tables with absolute fidelity, maintaining cell relationships for complex analytical queries.",
    perfectMarkdown: "Perfect Markdown",
    jsonSupport: "JSON Support",
    noiseRemovalTitle: "Semantic Noise-Removal",
    noiseRemovalDesc:
      "Stripping ads, sidebars, and navigation menus from web docs automatically.",
    chunkingTitle: "RAG-Ready Chunking",
    chunkingDesc:
      "Semantic chunking designed for 32k to 128k context windows with smart overlap.",
    developerFirstTitle: "Developer First",
    developerFirstDesc:
      "Deep integrations with the tools you already use. Native support for LangChain, LlamaIndex, and any Python project via our high-performance REST API.",
    integrationBanner: "Seamless Integration with your Vector Stack",
    footerTagline:
      "Building the infrastructure for high-fidelity LLM data ingestion.",
    footerProduct: "Product",
    footerFeatures: "Features",
    footerStatus: "Status",
    footerCompany: "Company",
    footerPrivacy: "Privacy",
    footerSitemap: "Sitemap",
    footerContact: "Contact",
    footerGithub: "GitHub",
    footerX: "X",
    footerCopyright:
      "© 2025 RAG-Refine. Built for the terminal luminescence.",
  },

  Auth: {
    backToHome: "Back to Home",
    or: "OR",
    email: "Email",
    emailPlaceholder: "you@company.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    continueWithGithub: "Continue with GitHub",
    continueWithGoogle: "Continue with Google",
  },

  Login: {
    title: "Welcome back",
    subtitle: "Enter your credentials to access your dashboard",
    forgotPassword: "Forgot password?",
    signIn: "Sign In",
    noAccount: "Don't have an account?",
    signUpLink: "Sign Up",
  },

  Signup: {
    title: "Create an account",
    subtitle: "Start cleaning your RAG data for free today",
    signUpWithGithub: "Sign up with GitHub",
    signUpWithGoogle: "Sign up with Google",
    fullName: "Full Name",
    fullNamePlaceholder: "Ada Lovelace",
    organizationName: "Organization Name",
    organizationPlaceholder: "Acme Corp",
    confirmPassword: "Confirm Password",
    passwordStrength: "Password strength",
    strengthWeak: "Weak",
    strengthMedium: "Medium",
    strengthStrong: "Strong",
    createAccount: "Create Account",
    termsNotice:
      "By clicking continue, you agree to our <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>.",
    alreadyHaveAccount: "Already have an account?",
    logInLink: "Log In",
  },

  Errors: {
    emailPasswordRequired: "Email and password are required.",
    allFieldsRequired: "All fields are required.",
    passwordsDoNotMatch: "Passwords do not match.",
    notAuthenticated: "Not authenticated",
    fileAndAccountRequired: "File and account are required.",
    unsupportedFileType: "Unsupported file type. Use PDF, DOCX, or HTML.",
    fileSizeExceeds: "File size exceeds 50MB limit.",
    accountRequired: "Account is required.",
    jobIdRequired: "Job ID is required.",
    keyIdRequired: "Key ID is required.",
    uploadFailed: "Upload failed",
    anonymizationFailed:
      "Could not sanitize sensitive data from the file. The upload was aborted to protect your data.",
  },

  Dashboard: {
    uploadDocuments: "Upload Documents",
    recentActivity: "Recent Activity",
    searchPlaceholder: "Search docs...",
    profile: "Profile",
    signOut: "Sign Out",
    pages: "pages",
  },

  Sidebar: {
    dashboard: "Dashboard",
    history: "History",
    apiKeys: "API Keys",
    settings: "Settings",
    support: "Support",
    upgradeToPro: "Upgrade to Pro",
    upgradeDescription: "Unlock unlimited pages and priority processing.",
    viewPlans: "View Plans",
  },

  History: {
    title: "History",
    searchPlaceholder: "Search history...",
    noResults: "No results found.",
    noHistory: "No conversions yet.",
    failedToLoad: "Failed to load history.",
    errorTooltip: "Conversion failed. Please re-upload the file.",
    groups: {
      today: "Today",
      yesterday: "Yesterday",
      lastSevenDays: "Last 7 Days",
      older: "Older",
    },
    actions: {
      copy: "Copy Markdown",
      delete: "Delete",
    },
  },

  Dropzone: {
    dropHere: "Drop files here...",
    dragAndDrop: "Drag & drop PDF files here",
    supportedFormats: "Supports .pdf, .docx, .html — Max 50MB",
    failed: "Failed",
  },

  Activity: {
    fileName: "File Name",
    status: "Status",
    date: "Date",
    actions: "Actions",
    noDocuments: "No documents yet. Upload a file to get started.",
    copied: "Copied!",
    copyMarkdown: "Copy markdown",
    downloadMarkdown: "Download markdown",
    delete: "Delete",
    justNow: "just now",
    minutesAgo: "{count}m ago",
    hoursAgo: "{count}h ago",
    daysAgo: "{count}d ago",
  },

  Status: {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
  },

  ApiKey: {
    title: "API Key",
    generateKey: "Generate Key",
    generating: "Generating...",
    saveKeyWarning:
      "Save this key now — you won't be able to see it again.",
    quickStart: "Quick start",
    noKeyDescription:
      "Generate an API key to integrate RAG-Refine into your pipeline.",
    copied: "Copied!",
  },

  ApiKeys: {
    pageTitle: "API Keys",
    pageDescription:
      "Authenticate your applications against the RAG-Refine REST API.",
    metaTitle: "API Keys — RAG-Refine",
    createKey: "Create API Key",
    tableNameHeader: "Name",
    tableKeyHeader: "Key",
    tableCreatedHeader: "Created",
    tableLastUsedHeader: "Last Used",
    tableActionsHeader: "Actions",
    neverUsed: "Never",
    revokeKey: "Revoke",
    revoking: "Revoking...",
    emptyTitle: "No API keys yet",
    emptyDescription:
      "Create your first API key to start integrating RAG-Refine into your pipeline.",
    emptyAction: "Create your first API Key",
    modalCreateTitle: "Create API Key",
    modalKeyNameLabel: "Key Name",
    modalKeyNamePlaceholder: "e.g. Production, CI/CD, LangChain",
    modalCreateButton: "Create",
    modalCreating: "Creating...",
    modalRevealTitle: "Your new API key",
    modalRevealWarning:
      "Copy this key now — you will not be able to see it again after closing this dialog.",
    modalCopyKey: "Copy key",
    modalCopied: "Copied!",
    modalDone: "I've saved my key",
    toastCreated: "API key created successfully.",
    toastRevoked: "API key revoked.",
    toastError: "Something went wrong. Please try again.",
  },

  JobDetail: {
    back: "Back",
    originalDocument: "Original Document",
    markdownOutput: "Markdown Output",
    documentNotAvailable: "Original document not available.",
    processing: "Processing...",
    conversionFailed: "Conversion failed.",
    noOutput: "No output available.",
    copyMarkdown: "Copy Markdown",
    copied: "Copied!",
    auditViewTitle: "Audit View",
    statsTotal: "Total Blocks",
    statsAvgConfidence: "Avg. Confidence",
    statsFlagged: "Flagged",
    statsPages: "Pages",
    filterAll: "All",
    filterHigh: "High",
    filterMedium: "Medium",
    filterLow: "Low",
    confidenceHigh: "High confidence",
    confidenceMedium: "Review suggested",
    confidenceLow: "Needs verification",
    pageOf: "Page {current} of {total}",
    prevPage: "Previous page",
    nextPage: "Next page",
    blockTypeHeading: "Heading",
    blockTypeParagraph: "Paragraph",
    blockTypeTable: "Table",
    blockTypeCode: "Code",
    blockTypeList: "List",
    blockTypeOther: "Other",
    noBlocks: "No blocks to display.",
    pageSeparator: "Page {page}",
    simulatedNote: "Confidence scores are estimated — structured output from the processing engine will improve accuracy.",
    liveUpdates: "Live",
    redactionClean: "No PII detected",
    redactionCount: "{count} items redacted",
    redactionBreakdown: "Redaction breakdown",
    redactionMissed:
      "{count} candidate(s) could not be located in the text layer.",
  },

  Settings: {
    metaTitle: "Settings — RAG-Refine",
    pageTitle: "Settings",
    pageDescription: "Manage your profile, preferences, and account.",

    tabs: {
      profile: "Profile",
      preferences: "Preferences",
      account: "Account",
    },

    profile: {
      title: "Profile",
      description: "Update your public profile information.",
      avatarLabel: "Avatar",
      nameLabel: "Full Name",
      namePlaceholder: "Ada Lovelace",
      emailLabel: "Email",
      emailReadOnly: "Email cannot be changed here.",
      saveButton: "Save Changes",
      saving: "Saving...",
    },

    preferences: {
      title: "Preferences",
      description: "Customize your RAG-Refine experience.",
      languageLabel: "Default RAG Output Language",
      languagePlaceholder: "Select language",
      themeLabel: "Appearance",
      themeDescription: "Switch between dark and light mode.",
      themeDark: "Dark",
      themeLight: "Light",
      saveButton: "Save Preferences",
      saving: "Saving...",
    },

    account: {
      title: "Account",
      description: "Manage your account settings.",
      dangerZoneTitle: "Danger Zone",
      dangerZoneDescription:
        "Permanently delete your account and all associated data. This action cannot be undone.",
      deleteButton: "Delete Account",
      deleteDialogTitle: "Delete Account",
      deleteDialogDescription:
        "Are you sure you want to delete your account? All your data, API keys, and conversion history will be permanently removed.",
      deleteDialogConfirm: "Yes, delete my account",
      deleteDialogCancel: "Cancel",
      deleting: "Deleting...",
    },

    notifications: {
      profileSaved: "Profile updated successfully.",
      preferencesSaved: "Preferences updated.",
      error: "Something went wrong. Please try again.",
    },
  },

  Jobs: {
    upload: {
      duplicate_found: "Document already processed. Retrieving result...",
      limit_error: "File size exceeds the 10MB limit.",
      verifying: "Checking for duplicates...",
    },
    status: {
      queued: "Document queued for processing...",
      processing: "Refining PDF structure...",
      refining: "AI is polishing the Markdown structure...",
      completed: "Conversion complete!",
      extracting: "Engine is extracting document structure...",
      finalizing: "Finalizing Markdown...",
    },
    error: {
      generic: "An error occurred during upload.",
      engine_offline: "The conversion engine is currently offline. Please try again later.",
    },
    success: {
      converted: "Document successfully converted to Markdown.",
    },
  },

  Support: {
    title: "Support",
    subtitle: "Get help or share your feedback with us.",

    form: {
      title: "Contact Us",
      subject: "Subject",
      subjectPlaceholder: "Select a subject",
      subjects: {
        bug: "Bug Report",
        feature: "Feature Request",
        billing: "Billing",
        other: "Other",
      },
      message: "Message",
      messagePlaceholder: "Describe your issue or suggestion in detail...",
      messageMinLength: "Message must be at least 20 characters.",
      submit: "Send Message",
      submitting: "Sending...",
      successToast: "Message sent! We'll get back to you shortly.",
      errorToast: "Failed to send message. Please try again.",
    },

    links: {
      title: "Quick Links",
      whatsapp: "Join WhatsApp Community",
      whatsappDesc: "Get real-time support and connect with other users.",
      docs: "Documentation",
      docsDesc: "Browse guides, API references, and tutorials.",
      email: "Email Support",
      emailDesc: "Reach us directly at support@rag-refine.com",
    },

    faq: {
      title: "Frequently Asked Questions",
      q1: "What file types does RAG-Refine support?",
      a1: "We currently support PDF, DOCX, and HTML files up to 50MB each.",
      q2: "What is the maximum number of pages per PDF?",
      a2: "Free plan supports PDFs up to 50 pages. Pro plan supports unlimited pages.",
      q3: "How is the Markdown output structured?",
      a3: "Output preserves headings, tables, lists, and code blocks with full semantic fidelity. Tables are reconstructed from OCR data into proper Markdown syntax.",
      q4: "Can I use the output directly in my RAG pipeline?",
      a4: "Yes. The output is optimized for chunking and embedding. You can consume it directly via our REST API or download it as a .md file.",
    },
  },
} as const;

export default messages;
