Project Context: RAG-Refine

Status: Initial Definition / Architecture Phase
Market: B2B SaaS (International)
Core Value: High-Fidelity Data ETL for RAG Systems
1. Project Purpose

RAG-Refine exists to solve the "Garbage In, Garbage Out" problem in AI implementations. Most companies fail at RAG (Retrieval-Augmented Generation) because their source documents (PDFs, Docs) are converted into messy, unformatted text. This tool acts as a specialized Data Cleaning Engine that transforms complex documents into LLM-Optimized Markdown.
Key Technical Differentiators:

    Structural Integrity: Unlike generic OCR, it identifies and reconstructs tables, headers, and lists.

    Noise Filtering: Intelligently removes non-content elements (page numbers, headers/footers, legal disclaimers).

    Semantic Optimization: Outputs Markdown specifically formatted to increase the "hit rate" of vector database retrievals.

2. Technical Ecosystem

The project follows a Hybrid Microservices Architecture to separate user management from heavy-duty document processing.
Frontend & Orchestration (The Brain)

    Framework: Next.js 16 (App Router).

    Language: TypeScript.

    UI/UX: Tailwind CSS + Shadcn/UI (Professional Dark Mode).

    State/Auth/DB: Supabase (PostgreSQL + Auth + Storage).

    Payment Gateway: Stripe (International Billing).

Processing Worker (The Muscle)

    Framework: FastAPI (Python).

    Core Libraries: marker-pdf, docling, or unstructured.

    Function: Receives raw binary files, executes vision-based parsing, and returns structured Markdown strings.

3. Core Domain Entities

    User: International developers or AI teams (B2B).

    Job: A single conversion process (contains: status, input_url, output_markdown, metadata).

    Credits/Quota: Usage-based system (pages processed vs. plan limit).

    API Key: Programmatic access tokens for integration into external pipelines.

4. Development Constraints & Standards

    Language: English Only. All code comments, variable names, UI strings, and documentation must be in English.

    Security: All file uploads must be private and scoped to the user's ID in Supabase.

    Reliability: File processing is asynchronous. The UI must handle pending, processing, completed, and failed states.

    Design: "Developer-First" aesthetic. Minimalist, high contrast, and performance-oriented.

    Scalability: The architecture must allow the Python Worker to scale independently of the Next.js frontend.

5. Success Metrics for the AI Coder

When generating code for this project, the AI should prioritize:

    Type Safety: Strict TypeScript interfaces.

    Modularity: Clean separation between UI components and Server Actions.

    Efficiency: Minimal re-renders and optimized file handling.

    UX: Instant feedback for user actions (optimistic updates where applicable).