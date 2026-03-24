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
  },
} as const;

export default messages;
