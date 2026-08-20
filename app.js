/**
 * Gabriel Carneiro Jr. — Portfolio Web Application
 * Modular JavaScript for Interactive Systems, Modals, Skills Filtering & UI State
 */

(function () {
  'use strict';

  // --- Project Data Dictionary for Deep-Dive Modals ---
  const projectDetails = {
    devats: {
      title: "DevATS — Multi-ATS Job Ingestion Platform & Real-Time Board",
      subtitle: "High-concurrency crawler & developer job search engine probing 600+ companies",
      badges: ["NestJS", "PostgreSQL (GIN)", "Prisma ORM", "React 19", "Tailwind CSS", "TypeScript"],
      githubUrl: "https://github.com/gabrielcjr/jobs_nestjs_react",
      liveUrl: null,
      overview: `
        DevATS is a production-grade Software Engineering Job Board and automated multi-ATS ingestion platform. 
        It solves the problem of decentralized tech job postings by concurrently probing and classifying live engineering roles 
        across Greenhouse, Lever, and Ashby without relying on expensive third-party APIs or brittle web scraping.
      `,
      challengesSolved: [
        {
          title: "Heuristic Candidate Slug Discovery",
          detail: "Automatically parses datasets containing 629+ companies, strips corporate suffixes (Inc, LLC, GmbH, Labs), and generates permutations to discover active job boards."
        },
        {
          title: "Non-Blocking Async Probing",
          detail: "Probes 600+ companies concurrently using background workers with real-time streaming progress updates (POST /api/v1/ingest/start-csv-discovery)."
        },
        {
          title: "100% Idempotent Upserts",
          detail: "Uses composite unique keys (atsProvider, externalJobId) to prevent duplication across runs, updating firstSeenAt and lastSeenAt timestamps seamlessly."
        },
        {
          title: "Sub-Millisecond Faceted Search",
          detail: "Leverages optimized PostgreSQL indexing to allow multi-tag tech filtering (40+ auto-extracted technologies) in sub-millisecond response times."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Company CSV (629 firms) │ ──> │ Heuristic Slug Normalizer  │ ──> │ Concurrent Multi-ATS Prober│
└─────────────────────────┘     └────────────────────────────┘     └─────────────┬─────────────┘
                                                                                 │
┌─────────────────────────┐     ┌────────────────────────────┐                   ▼
│ React 19 Faceted UI     │ <── │ PostgreSQL Database        │ <── ┌───────────────────────────┐
│ Master-Detail Dual Pane │     │ Prisma ORM Upsert Pipeline │     │ Regex Inference & Tagging │
└─────────────────────────┘     └────────────────────────────┘     │ (Role, Seniority, Tech)   │
                                                                   └───────────────────────────┘
      `,
      codeSnippet: `// Heuristic ATS Discovery & Ingestion Pipeline Sample
@Injectable()
export class IngestionService {
  async discoverAndSyncCompany(companyName: string): Promise<SyncResult> {
    const candidateSlugs = this.slugGenerator.generateVariations(companyName);
    const liveBoard = await this.atsProber.probeConcurrent(candidateSlugs, [
      AtsProvider.GREENHOUSE,
      AtsProvider.LEVER,
      AtsProvider.ASHBY,
    ]);

    if (!liveBoard) return { status: 'NOT_FOUND' };

    const rawJobs = await this.fetchJobs(liveBoard);
    const normalizedJobs = rawJobs.map(job => this.classifier.normalize(job));

    return await this.prisma.job.upsertManyIdempotent(normalizedJobs);
  }
}`
    },

    atsproof: {
      title: "ATS MatchProof — Dual-Engine Resume & Job Matcher",
      subtitle: "Dual-Engine AI resume simulation with zero-disk in-memory stream processing",
      badges: ["FastAPI", "Python", "HTMX", "Tailwind CSS", "Dual-AI Engine", "In-Memory PDF", "Bilingual"],
      githubUrl: "https://github.com/gabrielcjr/atsproof",
      liveUrl: "https://atsproof.website/",
      overview: `
        ATS MatchProof (live at atsproof.website) is a 100% free, zero-account dual-engine ATS simulator.
        It enables job applicants to benchmark their PDF resumes against specific job descriptions, revealing keyword gaps, 
        experience alignment scores, and instant AI-optimized bullet point rewrite recommendations.
      `,
      challengesSolved: [
        {
          title: "Zero-Storage Privacy Architecture",
          detail: "Resumes are uploaded via multipart streams, parsed directly in volatile RAM, and immediately discarded. No personal data or resumes ever hit disk or persistent databases."
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
          title: "Bilingual Internationalization",
          detail: "Built with seamless English (EN) and Portuguese (PT) multi-locale support and instant DOCX ATS-friendly resume template downloads."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ User PDF + Job Desc     │ ──> │ FastAPI In-Memory Stream   │ ──> │ PDF Decoder (pypdf/fitz)  │
└─────────────────────────┘     └────────────────────────────┘     └─────────────┬─────────────┘
                                                                                 │
┌─────────────────────────┐     ┌────────────────────────────┐                   ▼
│ HTMX Dynamic Swap       │ <── │ Dual-Engine AI Analyzer    │ <── ┌───────────────────────────┐
│ Instant Score & Bullets │     │ Claude / OpenAI Fallback   │     │ Keyword & Skill Matcher   │
└─────────────────────────┘     └────────────────────────────┘     └───────────────────────────┘
      `,
      codeSnippet: `# FastAPI Streaming In-Memory Resume Evaluator
@router.post("/analyze", response_class=HTMLResponse)
async def analyze_match(
    request: Request,
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    lang: str = Form("en"),
):
    # Enforce strict in-memory parsing (Zero persistent disk I/O)
    content_bytes = await resume.read()
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
      badges: ["Python", "Django", "PostgreSQL", "HTMX 2.0", "Tailwind CSS 4", "Pytest", "PDF Engine"],
      githubUrl: "https://github.com/gabrielcjr/amae",
      liveUrl: null,
      overview: `
        AMAE (Agência Missionária de Apoio Estratégico) is a production-grade SSR web application engineered 
        to connect financial sponsors (Investors) with missionaries in the field across Brazil. 
        It automates monthly financial adoptions, tracks field locations via geocoded coordinates, handles double-entry ledgers, 
        and generates automated PDF audit statements on the fly.
      `,
      challengesSolved: [
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
        },
        {
          title: "Automated PDF Receipt & Statement Pipeline",
          detail: "Generates cryptographic financial receipts and monthly statements dynamically without external heavyweight services."
        }
      ],
      architectureFlow: `
┌─────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐
│ Investor & Missionary   │ ──> │ Django Domain Layer        │ ──> │ PostgreSQL Database       │
│ Financial Adoption UI   │     │ missions / finance apps    │     │ Foreign Key Constraints   │
└─────────────────────────┘     └─────────────┬──────────────┘     └─────────────┬─────────────┘
                                              │                                  │
                                              ▼                                  ▼
                                ┌────────────────────────────┐     ┌───────────────────────────┐
                                │ On-The-Fly PDF Generator   │ ──> │ HTMX 2.0 SSR UI Views     │
                                │ Monthly Statement Exports  │     │ Geocoded Coordinate Maps  │
                                └────────────────────────────┘     └───────────────────────────┘
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
    }
  };

  // --- Main Application Controller ---
  const app = {
    init: function () {
      this.initNavbar();
      this.initSkillsFilter();
      this.initModals();
      this.initSmoothScroll();
    },

    // --- Navbar & Mobile Drawer ---
    initNavbar: function () {
      const toggle = document.getElementById('mobile-menu-toggle');
      const drawer = document.getElementById('mobile-drawer');
      const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

      if (toggle && drawer) {
        toggle.addEventListener('click', () => {
          drawer.classList.toggle('active');
        });

        // Close drawer when clicking a mobile link
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            drawer.classList.remove('active');
          });
        });
      }

      // Scroll Spy for active nav link
      window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
          const sectionHeight = current.offsetHeight;
          const sectionTop = current.offsetTop - 120;
          const sectionId = current.getAttribute('id');

          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
              }
            });
          }
        });
      });
    },

    // --- Interactive Skills Matrix Filtering ---
    initSkillsFilter: function () {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const skillCards = document.querySelectorAll('.skill-category-card');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          // Update active button state
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const category = btn.getAttribute('data-category');

          skillCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });
        });
      });
    },

    // --- Modal Management (Project Deep Dive & Resume) ---
    initModals: function () {
      const openResumeBtn = document.getElementById('open-resume-btn');
      const heroResumeBtn = document.getElementById('hero-view-cv-btn');
      const mobileResumeBtn = document.getElementById('mobile-resume-btn');

      const openResume = () => this.openModal('resume-modal');

      if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
      if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);
      if (mobileResumeBtn) mobileResumeBtn.addEventListener('click', openResume);

      // Close modal on Escape key or backdrop click
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-overlay.active').forEach(m => {
            m.classList.remove('active');
          });
        }
      });

      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('active');
          }
        });
      });
    },

    openModal: function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeModal: function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    // --- Open Project Architecture Deep-Dive Modal ---
    openProjectModal: function (projectId) {
      const data = projectDetails[projectId];
      if (!data) return;

      const titleElem = document.getElementById('modal-project-title');
      const bodyElem = document.getElementById('modal-project-body');

      titleElem.textContent = data.title;

      let badgesHtml = data.badges.map(b => `<span class="tag-badge highlight">${b}</span>`).join(' ');

      let challengesHtml = data.challengesSolved.map(c => `
        <div style="margin-bottom: 0.85rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
          <strong style="color: #818cf8; display: block; margin-bottom: 0.25rem;">${c.title}</strong>
          <span style="font-size: 0.875rem; color: #94a3b8; line-height: 1.5;">${c.detail}</span>
        </div>
      `).join('');

      let liveBtnHtml = data.liveUrl ? `
        <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald btn-sm">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          <span>Launch Live Application</span>
        </a>
      ` : '';

      bodyElem.innerHTML = `
        <div class="modal-deepdive-grid">
          <div>
            <p style="font-size: 1rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 1.25rem;">
              ${data.overview}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
              ${badgesHtml}
            </div>
          </div>

          <div>
            <h4 class="modal-section-title">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <span>System Architecture & Data Pipeline</span>
            </h4>
            <pre class="modal-code-block"><code>${data.architectureFlow.trim()}</code></pre>
          </div>

          <div>
            <h4 class="modal-section-title">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span>Key Technical Challenges & Solutions</span>
            </h4>
            ${challengesHtml}
          </div>

          <div>
            <h4 class="modal-section-title">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
              <span>Core Implementation Code Pattern</span>
            </h4>
            <pre class="modal-code-block"><code>${data.codeSnippet}</code></pre>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap;">
            ${liveBtnHtml}
            <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
              </svg>
              <span>View Source on GitHub</span>
            </a>
          </div>
        </div>
      `;

      this.openModal('project-modal');
    },

    // --- Clipboard Copy Helper ---
    copyText: function (text, successMsg) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMsg || 'Copied to clipboard!');
      }).catch(() => {
        // Fallback prompt
        window.prompt('Copy to clipboard:', text);
      });
    },

    // --- Toast Notification Feedback ---
    showToast: function (msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-message');

      if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add('active');

        setTimeout(() => {
          toast.classList.remove('active');
        }, 3000);
      }
    },

    // --- Contact Form Handler ---
    handleContactSubmit: function (e) {
      e.preventDefault();
      const form = e.target;
      const name = form.elements['name'].value;
      const email = form.elements['email'].value;
      const subject = form.elements['subject'].value;
      const message = form.elements['message'].value;

      // Construct mailto link
      const mailtoUrl = `mailto:gabrielcjr4@gmail.com?subject=${encodeURIComponent(`[Portfolio Inquiry] ${subject} - ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

      // Show toast and trigger email client
      this.showToast('Preparing your message...');
      window.location.href = mailtoUrl;

      // Reset form
      form.reset();
    },

    // --- Smooth Scrolling for Navigation ---
    initSmoothScroll: function () {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;

          const targetElem = document.querySelector(targetId);
          if (targetElem) {
            e.preventDefault();
            targetElem.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }
  };

  // Expose app globally to window
  window.app = app;

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }
})();
