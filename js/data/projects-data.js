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
      title: "K3s Cloud-Native GitOps & Jaeger Observability Platform",
      subtitle: "Declarative Kubernetes continuous delivery with ArgoCD, OpenTelemetry, and Jaeger Distributed Tracing",
      badges: ["Kubernetes (K3s)", "ArgoCD", "Jaeger", "OpenTelemetry (OTel)", "GitOps", "Docker Hub CI"],
      githubUrl: "https://github.com/gabrielcjr/k8s_portfolio",
      liveUrl: "https://gabrielcjr.website",
      overview: `
        A high-availability production cloud-native infrastructure orchestrating Gabriel's complete project ecosystem 
        on a multi-tenant K3s Kubernetes cluster. Implements declarative GitOps continuous delivery with ArgoCD 
        (automated syncing, self-healing, resource pruning), unified distributed tracing with Jaeger (native OpenTelemetry, 
        end-to-end request flamegraphs, and latency percentile tracking) with automated SSL ingress termination.
      `,
      challengesSolved: [
        {
          title: "Declarative GitOps Delivery & Self-Healing (ArgoCD)",
          detail: "Configured ArgoCD Application CRDs managing all live environments (portfolio, amae, jobs, atsproof, jaeger), automatically pulling immutable SHA-tagged images built via GitHub Actions and enforcing zero configuration drift."
        },
        {
          title: "Unified Jaeger Distributed Tracing & OpenTelemetry",
          detail: "Deployed Jaeger All-in-One natively in Kubernetes ingesting distributed traces and spans directly via OTLP gRPC/HTTP (:4317/:4318) for instantaneous multi-tenant flamegraphs."
        },
        {
          title: "Centralized Multi-Tenant OTel Trace Propagation",
          detail: "Propagates W3C TraceContext headers across all microservices (EdgeShield, Jobs, AMAE, ATS MatchProof) into Jaeger for unified query debugging and error triage without SSH container access."
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
                                             ▼
                                ┌─────────────────────────┐
                                │ Jaeger All-in-One       │
                                │ OTLP :4317/:4318        │
                                │ Distributed Flamegraphs │
                                └─────────────────────────┘
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
    },

    edgeshield: {
      title: "EdgeShield — Distributed API Gateway & Pure-Python Rate Limiter",
      subtitle: "High-concurrency async reverse proxy & distributed rate limiter with Circuit Breaker and native Jaeger telemetry",
      badges: ["Python 3.12", "FastAPI", "Redis Pipelines", "Circuit Breaker", "OpenTelemetry (OTel)", "Jaeger", "K3s GitOps", "SDD & ADR"],
      githubUrl: "https://github.com/gabrielcjr/edgeshield",
      liveUrl: "https://gabrielcjr.website",
      overview: `
        EdgeShield is a high-performance distributed API Gateway and traffic shaping service engineered in Pure Python 3.12 
        (FastAPI, AsyncIO, HTTPX) and atomic Redis pipelines. Designed to guard microservices in multi-tenant Kubernetes 
        clusters against noisy neighbors and brute-force traffic spikes, it features a dual-tier architecture with an in-memory 
        Circuit Breaker fallback and native OpenTelemetry telemetry streaming directly into Jaeger.
      `,
      challengesSolved: [
        {
          title: "Atomic Sliding Window Log in Pure Python (Zero Lua)",
          detail: "Eliminates check-then-act race conditions across horizontal replicas using atomic single-transaction Redis Sorted Set pipelines with monotonic ZRANK evaluation, guaranteeing strict concurrency safety under heavy load."
        },
        {
          title: "Dual-Tier In-Memory Circuit Breaker Fallback (ADR 0002)",
          detail: "Protects against cascading Redis failures by fast-failing to an in-memory bounded sliding window limiter when Redis connection errors or timeouts occur, maintaining 100% gateway uptime without unconstrained upstream flooding."
        },
        {
          title: "Native Jaeger Tracing & OpenTelemetry Trace Propagation (ADR 0003)",
          detail: "Exports custom OTLP metrics (edgeshield_requests_total, edgeshield_ratelimit_blocked_total, edgeshield_redis_latency_seconds) to Jaeger (:4318) and injects W3C TraceContext headers upstream for end-to-end distributed flamegraphs."
        },
        {
          title: "RFC 7807 Problem Details & Tier Policy Matrix",
          detail: "Enforces granular authorization tiers (Anonymous, Free, Pro, Enterprise) identified via IP or API Keys, emitting standardized RFC 7807 problem details with Retry-After and X-RateLimit-* headers on quota exhaustion."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Client Traffic (IP/Key) │ ──> │ Policy & Tier Evaluator    │ ──> │ Atomic Redis Pipeline     │
│ Headers & W3C Traces    │     │ (Anonymous, Pro, Ent)      │     │ (ZSET + ZRANK Pure Python)│
└─────────────────────────┘     └────────────────────────────┘     └─────────────┬─────────────┘
                                                                                 │
┌─────────────────────────┐     ┌────────────────────────────┐                   ▼
│ Jaeger OTel Collector   │ <── │ HTTPX Reverse Proxy        │ <── ┌───────────────────────────┐
│ (:4318 Distributed APM) │     │ Streaming & TraceContext   │     │ Allowed (200) / 429 RFC   │
└─────────────────────────┘     └────────────────────────────┘     │ [Fallback Circuit Breaker]│
                                                                   └───────────────────────────┘
      `,
      codeSnippet: `# Pure Python Atomic Sliding Window via Redis Pipelines (EdgeShield)
async def _check_sliding_window(self, key: str, policy: TierPolicy, cost: int) -> RateLimitResult:
    redis_key = f"edgeshield:sw:{key}"
    now_ms = time.time() * 1000.0
    window_ms = policy.window_seconds * 1000.0
    member = f"{now_ms}:{uuid.uuid4().hex}"

    # Atomic single-transaction pipeline: clean expired, record request, get rank & oldest
    async with self.redis.pipeline(transaction=True) as pipe:
        pipe.zremrangebyscore(redis_key, 0, now_ms - window_ms)
        pipe.zadd(redis_key, {member: now_ms})
        pipe.zrank(redis_key, member)
        pipe.pexpire(redis_key, int(window_ms))
        pipe.zrange(redis_key, 0, 0, withscores=True)
        res = await pipe.execute()

    _cleaned, _added, rank, _pexpire, oldest_entries = res

    # Check monotonic rank against policy limit
    if rank is not None and rank < policy.limit:
        return RateLimitResult(allowed=True, limit=policy.limit, remaining=policy.limit - (rank + 1), reset_after_seconds=0.0, tier=policy.name)
    else:
        await self.redis.zrem(redis_key, member) # Rollback over-quota speculative entry
        retry_after = (float(oldest_entries[0][1]) + window_ms - now_ms) / 1000.0 if oldest_entries else policy.window_seconds
        return RateLimitResult(allowed=False, limit=policy.limit, remaining=0, reset_after_seconds=max(0.001, retry_after), tier=policy.name)`
    },

    sentinelmcp: {
      title: "SentinelMCP — Autonomous Kubernetes SRE Agent & MCP Orchestrator",
      subtitle: "Autonomous self-healing SRE agent powered by Model Context Protocol (MCP), multi-provider ReAct reasoning, and guarded runbooks",
      badges: ["Python 3.12", "FastAPI", "Model Context Protocol (MCP)", "Kubernetes (K3s)", "Groq Cloud (Llama/Qwen)", "Google Gemini", "Jaeger APM", "ReAct Loop", "Autonomous SRE"],
      githubUrl: "https://github.com/gabrielcjr/sentinelmcp",
      liveUrl: "https://gabrielcjr.website",
      overview: `
        SentinelMCP is an autonomous Site Reliability Engineering (SRE) agent and Model Context Protocol (MCP) server 
        engineered in Python 3.12 (FastAPI, AsyncIO, Pydantic) to provide closed-loop incident self-healing across Kubernetes workloads. 
        It connects continuous observability signals from Jaeger APM and cluster metrics with multi-model ReAct reasoning 
        (Groq Cloud, Google Gemini, and a deterministic offline heuristic engine) to diagnose microservice degradations, 
        execute guarded cluster mutations (zero-downtime rolling restarts, replica scaling, circuit breaking), and autonomously 
        synthesize executive post-mortem Root Cause Analysis (RCA) reports.
      `,
      challengesSolved: [
        {
          title: "Multi-Model ReAct SRE Loop & Zero-Cost Heuristic Fallback",
          detail: "Orchestrates multi-turn ReAct reasoning across free-tier LLM providers (Groq Qwen/Llama and Google Gemini) with an automatic failover to a zero-cost Deterministic Runbook Engine when network outages or API rate limits occur."
        },
        {
          title: "Blast-Radius Safety Guardrails & Rate-Limited Mutations",
          detail: "Protects production clusters against cascade failures by enforcing strict rate limits (max 3 restarts/hour), target cooldown intervals (120s), replica scaling boundaries (1-10), and mandatory dry-run diff verification prior to mutation execution."
        },
        {
          title: "Cluster-Wide Cross-Namespace K8s Discovery & GitOps Reconciliation",
          detail: "Implements cluster-wide workload discovery via RBAC ClusterRoles to automatically resolve services across isolated namespaces ('portfolio', 'edgeshield', 'default'), with GitOps drift awareness (ArgoCD) selecting rolling restarts over direct replica scaling."
        },
        {
          title: "Native Model Context Protocol (MCP) & Interactive CLI Runner",
          detail: "Exposes diagnostic and remediation tools via standard MCP JSON-RPC protocol for agentic orchestration, paired with an interactive Rich CLI runner for human-in-the-loop incident response and live mutation execution."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Jaeger APM / Prom Alerts│ ──> │ FastAPI Webhook Ingestion  │ ──> │ ReAct SRE Orchestrator    │
│ (Latency, 5xx Spikes)   │     │ & Incident Registry        │     │ (Groq / Gemini / Fallback)│
└─────────────────────────┘     └────────────────────────────┘     └─────────────┬─────────────┘
                                                                                 │
┌─────────────────────────┐     ┌────────────────────────────┐                   ▼
│ Markdown Post-Mortem RCA│ <── │ K3s Cluster Mutation       │ <── ┌───────────────────────────┐
│ Executive Report Synthes│     │ (Rollout Restart / Scale)  │     │ Guardrail Safety Barrier  │
└─────────────────────────┘     └────────────────────────────┘     │ Max Restarts, Cooldown,   │
                                                                   │ Blast-Radius Dry-Run Diff │
                                                                   └───────────────────────────┘
      `,
      codeSnippet: `# SentinelMCP Autonomous ReAct Remediation Tool Invocation
async def execute_remediation_runbook(
    incident_id: str,
    action_type: str,
    target: str,
    params: Optional[Dict[str, Any]] = None,
    dry_run: Optional[bool] = None,
) -> Dict[str, Any]:
    is_dry_run = dry_run if dry_run is not None else settings.sentinel_dry_run
    
    # Enforce safety guardrails (rate limits, cooldowns, scaling bounds)
    default_guardrails.validate_action(
        incident_id=incident_id,
        action_type=action_type,
        target=target,
        params=params or {},
        dry_run=is_dry_run,
    )
    
    # Resolve target across Kubernetes cluster namespaces
    namespace, dep_name = await resolve_deployment_namespace(target)
    
    if action_type == "restart":
        diff = f"deployment.apps/{dep_name} restarted (remediation for {incident_id})"
        if not is_dry_run:
            await k8s_client.restart_deployment(name=dep_name, namespace=namespace)
        return RemediationResult(success=True, action_type="restart", dry_run=is_dry_run, diff=diff).model_dump()`
    }
  };

if (typeof window !== "undefined") {
  window.projectDetails = projectDetails;
}
