/**
 * Project Data Dictionary for Architecture Deep-Dive Modals
 */
export const projectDetails = {
    devats: {
      title: "DevATS — Multi-ATS Job Ingestion Platform & Real-Time Board",
      subtitle: "High-concurrency crawler & developer job search engine probing 600+ companies",
      badges: ["NestJS", "PostgreSQL (GIN)", "Redis", "Prisma ORM", "React 19", "Tailwind CSS", "TypeScript", "SDD & ADR"],
      githubUrl: "https://github.com/gabrielcjr/jobs_nestjs_react",
      liveUrl: "https://findjobs.gabrielcjr.website",
      overview: `
        DevATS is a production-grade Software Engineering Job Board and automated multi-ATS ingestion platform. 
        It solves the problem of decentralized tech job postings by concurrently probing and classifying live engineering roles 
        across Greenhouse, Lever, and Ashby without relying on expensive third-party APIs or brittle web scraping. 
        Engineered with strict Spec-Driven Development (SDD) and Architecture Decision Records (ADR 0001–0005).
      `,
      challengesSolved: [
        {
          title: "Intelligent IT-Only Classifier (isItJob)",
          detail: "Guards ATS adapters (Ashby, Greenhouse, Lever) against non-developer positions using regex and keyword classifiers, paired with an automated CLI script and endpoint (POST /jobs/prune-non-it) to sweep legacy non-IT records."
        },
        {
          title: "45-Day Stale Retention & Soft-Deletion Lifecycle (ADR/SDD 0005)",
          detail: "Automates retention lifecycle policies by soft-deleting postings older than 45 days, preventing expired roles from polluting live queries while guarding ingestion from resurrecting dead positions."
        },
        {
          title: "Compensation & Salary Range Parsing (ADR/SDD 0004)",
          detail: "Extracts structured numeric compensation boundaries (min/max pay and currency denominations) from raw ATS payloads into database schema columns for transparent salary analytics."
        },
        {
          title: "Redis Facet Caching Subsystem (ADR/SDD 0001)",
          detail: "Caches top 100 tech facet tags and filter combinations in Redis, delivering sub-millisecond dynamic slicing alongside PostgreSQL GIN index filtering."
        },
        {
          title: "Heuristic Slug Normalization & Concurrent Probing",
          detail: "Parses datasets with 629+ companies, strips corporate legal suffixes (Inc, LLC, GmbH), and probes 3 ATS platforms concurrently with 100% idempotent upsert queues."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Company CSV (629 firms) │ ──> │ Heuristic Slug Normalizer  │ ──> │ Concurrent Multi-ATS Prober│
└─────────────────────────┘     └────────────────────────────┘     └─────────────┬─────────────┘
                                                                                 │
┌─────────────────────────┐     ┌────────────────────────────┐                   ▼
│ React 19 Faceted UI     │ <── │ Redis Cache Layer (Tags)   │ <── ┌───────────────────────────┐
│ Master-Detail Dual Pane │     │ PostgreSQL (GIN Indexes)   │     │ isItJob Classifier Guard  │
└─────────────────────────┘     └────────────────────────────┘     │ Ashby Salary Parser       │
                                                                   │ 45-Day Stale Pruning Cron │
                                                                   └───────────────────────────┘
      `,
      codeSnippet: `// Intelligent IT Classifier Guard & Ingestion Pipeline Sample
export function isItJob(title: string, categories?: string[]): boolean {
  const normalized = title.toLowerCase();
  
  // Guard against non-development / administrative postings
  const nonItExclusions = /\\b(sales|account executive|recruiter|hr coordinator|legal|finance|marketing)\\b/i;
  if (nonItExclusions.test(normalized)) return false;

  // Strict technical keywords requirement
  const itPatterns = /\\b(software|developer|engineer|full[- ]?stack|backend|frontend|devops|sre|platform|data)\\b/i;
  return itPatterns.test(normalized);
}

@Injectable()
export class IngestionService {
  async processJob(job: RawAtsJob): Promise<void> {
    if (!isItJob(job.title, job.departments)) return; // Reject non-IT
    const salary = this.salaryParser.extract(job.rawContent);
    await this.prisma.job.upsertIdempotent({ ...job, ...salary });
  }
}`
    },

    atsproof: {
      title: "ATS MatchProof — Dual-Engine Resume & Job Matcher",
      subtitle: "Dual-Engine AI resume simulation with zero-disk in-memory stream processing",
      badges: ["FastAPI", "Python", "HTMX", "Tailwind CSS", "Dual-AI Engine", "In-Memory PDF (200KB)", "Bilingual"],
      githubUrl: "https://github.com/gabrielcjr/atsproof",
      liveUrl: "https://atsproof.website/",
      overview: `
        ATS MatchProof (live at atsproof.website) is a 100% free, zero-account dual-engine ATS simulator.
        It enables job applicants to benchmark their PDF resumes against specific job descriptions, revealing keyword gaps, 
        experience alignment scores, and instant AI-optimized bullet point rewrite recommendations with strict in-memory privacy.
      `,
      challengesSolved: [
        {
          title: "Zero-Storage Privacy Architecture (200KB Ceiling)",
          detail: "Resumes are uploaded via multipart streams, validated against a 200KB bounded ceiling, parsed directly in volatile RAM, and immediately discarded. No personal data or resumes ever hit disk or persistent databases."
        },
        {
          title: "High-Throughput FastAPI + HTMX Stack",
          detail: "Server-side rendered micro-fragments powered by HTMX provide an instant, single-page app feel with zero heavy client-side JavaScript bundling."
        },
        {
          title: "Dual-AI Benchmarking Engine",
          detail: "Performs simultaneous keyword density extraction and semantic LLM evaluation to provide both mathematical keyword match percentages and contextual advice."
        },
        {
          title: "Bilingual Internationalization & Automated CI/CD",
          detail: "Built with seamless English (EN) and Portuguese (PT) multi-locale support, instant DOCX ATS-friendly resume template downloads, and GitHub Actions CI with automated Docker Hub tag pruning."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ User PDF (Max 200KB)    │ ──> │ FastAPI In-Memory Stream   │ ──> │ RAM PDF Decoder (pypdf)   │
│ + Job Description       │     │ (Zero-Disk Persistence)    │     │ Strict Buffer Bounds      │
└─────────────────────────┘     └────────────────────────────┘     └─────────────┬─────────────┘
                                                                                 │
┌─────────────────────────┐     ┌────────────────────────────┐                   ▼
│ HTMX Dynamic Swap       │ <── │ Dual-Engine AI Analyzer    │ <── ┌───────────────────────────┐
│ Instant Score & Bullets │     │ Claude / OpenAI Fallback   │     │ Keyword & Skill Matcher   │
└─────────────────────────┘     └────────────────────────────┘     └───────────────────────────┘
      `,
      codeSnippet: `# FastAPI Streaming In-Memory Resume Evaluator (200KB Ceiling)
MAX_PDF_SIZE_BYTES: int = 200 * 1024  # Enforce strict 200 KB ceiling

@router.post("/analyze", response_class=HTMLResponse)
async def analyze_match(
    request: Request,
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    lang: str = Form("en"),
):
    # Enforce strict in-memory parsing (Zero persistent disk I/O)
    content_bytes = await resume.read()
    if len(content_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Resume exceeds 200KB limit")

    extracted_text = extract_pdf_in_memory(content_bytes)

    # Run Dual-Engine ATS Evaluation
    score_report = await ats_engine.evaluate(
        resume_text=extracted_text, 
        job_desc=job_description, 
        locale=lang
    )

    return templates.TemplateResponse(
        "fragments/results.html", 
        {"request": request, "report": score_report}
    )`
    },

    amae: {
      title: "AMAE — Missionary & Financial Ledger Operations Platform",
      subtitle: "Clean Architecture SSR platform connecting financial sponsors with field operations",
      badges: ["Python", "Django", "PostgreSQL", "Redis", "HTMX 2.0", "Tailwind CSS 4", "Bilingual (EN/PT)", "Pytest"],
      githubUrl: "https://github.com/gabrielcjr/amae",
      liveUrl: "https://amae.gabrielcjr.website",
      overview: `
        AMAE (Agência Missionária de Apoio Estratégico) is a production-grade SSR web application engineered 
        to connect financial sponsors (Investors) with missionaries in the field across Brazil. 
        It automates monthly financial adoptions, tracks field locations via geocoded coordinates, handles double-entry ledgers, 
        and provides full bilingual internationalization (English default and Brazilian Portuguese).
      `,
      challengesSolved: [
        {
          title: "Bilingual Internationalization (i18n & l10n)",
          detail: "Engineered comprehensive multi-language support with English as default and Brazilian Portuguese (PT-BR), including dynamic navbar language switching, localized model choices and form labels, compiled gettext catalogs, and a dedicated Pytest test suite."
        },
        {
          title: "Decoupled Clean Domain Architecture",
          detail: "Divided into isolated Django applications ('missions', 'finance', 'pages') preventing circular dependencies and isolating domain logic cleanly."
        },
        {
          title: "Geocoded Coordinate Mapping",
          detail: "Handles multi-location mission fields with decimal precision latitude/longitude tracking for interactive visual field management."
        },
        {
          title: "Automated Recurring Financial Ledger",
          detail: "Maintains relational transaction chains for income and expense allocation with dynamic audit rules and status calculation."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Investor & Missionary   │ ──> │ Django Domain Layer        │ ──> │ PostgreSQL Database       │
│ Financial Adoption UI   │     │ missions / finance apps    │     │ Redis Session Cache       │
└───────────┬─────────────┘     └─────────────┬──────────────┘     └─────────────┬─────────────┘
            │                                 │                                  │
            ▼                                 ▼                                  ▼
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Bilingual i18n Engine   │     │ On-The-Fly PDF Generator   │ ──> │ HTMX 2.0 SSR UI Views     │
│ (EN Default / PT-BR)    │     │ Monthly Statement Exports  │     │ Geocoded Coordinate Maps  │
└─────────────────────────┘     └────────────────────────────┘     └───────────────────────────┘
      `,
      codeSnippet: `# Decoupled Domain Calculation & Financial Ledger (Django)
class MissionField(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    missionaries_needed = models.PositiveIntegerField(default=1)

    def calculate_adoption_status(self) -> str:
        total_monthly = self.adoptions.aggregate(
            total=models.Sum('monthly_value')
        )['total'] or Decimal('0.00')
        
        target_budget = self.missionaries_needed * Decimal('2500.00')
        return "FULLY_FUNDED" if total_monthly >= target_budget else "PARTIAL"`
    },

    k8s_portfolio: {
      title: "K3s Cloud-Native GitOps & Observability Platform",
      subtitle: "Declarative Kubernetes continuous delivery with ArgoCD, Prometheus, Grafana 360, and Loki/Promtail",
      badges: ["Kubernetes (K3s)", "ArgoCD", "Prometheus", "Grafana", "Loki", "Promtail", "GitOps", "Docker Hub CI"],
      githubUrl: "https://github.com/gabrielcjr/k8s_portfolio",
      liveUrl: "https://gabrielcjr.website",
      overview: `
        A high-availability production cloud-native infrastructure orchestrating Gabriel's complete project ecosystem 
        on a multi-tenant K3s Kubernetes cluster. Implements declarative GitOps continuous delivery with ArgoCD 
        (automated syncing, self-healing, resource pruning), centralized multi-tenant log aggregation with Loki & Promtail, 
        and real-time telemetry via Prometheus and a custom-engineered 'K3s Production Apps 360' Grafana dashboard.
      `,
      challengesSolved: [
        {
          title: "Declarative GitOps Delivery & Self-Healing (ArgoCD)",
          detail: "Configured ArgoCD Application CRDs managing all live environments (portfolio, amae, jobs, atsproof), automatically pulling immutable SHA-tagged images built via GitHub Actions and enforcing zero configuration drift."
        },
        {
          title: "Custom 'K3s Production Apps 360' Telemetry (Prometheus & Grafana)",
          detail: "Engineered a comprehensive 360-degree observability dashboard monitoring container CPU/RAM quotas, pod restart counters, HTTP ingress status, and node health in real-time."
        },
        {
          title: "Centralized Multi-Tenant Log Streaming (Loki & Promtail)",
          detail: "Deployed Promtail daemonsets to capture container stdout streams across all Kubernetes namespaces, feeding directly into Grafana Loki for unified query debugging without SSH container access."
        },
        {
          title: "Multi-Arch Parallel CI & Automated Docker Hub Tag Pruning",
          detail: "Implemented native builder platform acceleration in GitHub Actions with automated Docker Hub tag pruning routines (keeping latest + 3 most recent tags) to eliminate registry storage bloat."
        },
        {
          title: "Automated Host Healthcheck & SSL Verification Suite",
          detail: "Engineered the master cluster script (start_all_services.sh) automating K3s control-plane health, Nginx reverse-proxy SSL/TLS termination, and HTTP endpoint readiness testing."
        }
      ],
      architectureFlow: `
┌────────────────────────┐      ┌─────────────────────────┐      ┌────────────────────────┐
│ GitHub Commits (Master)│ ───> │ GitHub Actions CI Multi │ ───> │ Docker Hub Registry    │
│ (Jobs, ATS, AMAE, Port)│      │ Native ARM/AMD64 Build  │      │ Automated Tag Pruning  │
└────────────────────────┘      └─────────────────────────┘      └───────────┬────────────┘
                                                                             │
┌────────────────────────┐      ┌─────────────────────────┐                  ▼
│ Host Nginx SSL Gateway │ <─── │ K3s Kubernetes Cluster  │ <─── ┌────────────────────────┐
│ gabrielcjr.website     │      │ Multi-Tenant Namespaces │      │ ArgoCD GitOps Engine   │
└────────────────────────┘      └────────────┬────────────┘      │ Auto-Sync & Self-Heal  │
                                             │                   └────────────────────────┘
                                ┌────────────┴────────────┐
                                ▼                         ▼
                   ┌─────────────────────────┐ ┌─────────────────────────┐
                   │ Prometheus Metrics      │ │ Promtail ➔ Loki Logs    │
                   │ Grafana 360 Dashboard   │ │ Centralized Aggregation │
                   └─────────────────────────┘ └─────────────────────────┘
      `,
      codeSnippet: `# ArgoCD GitOps Declarative Application Manifest (k8s_portfolio)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: jobs-production
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/gabrielcjr/jobs_nestjs_react.git
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: jobs
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true`
    }
  };

if (typeof window !== "undefined") {
  window.projectDetails = projectDetails;
}
