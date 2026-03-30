# NLnet application — plain text for web form

Use the sections below as **reference wording** for https://nlnet.nl/propose (NGI Zero Commons Fund). Revise in your own voice before submitting; align numbers and facts with `docs/NLNET-PROPOSAL.md`.

---

## Field 1 — Abstract (whole project and expected outcomes)

HostingLint is an MIT-licensed static analyzer aimed at add-ons and integrations for hosting control panels. It checks source code for risky patterns, compatibility problems, and maintainability issues—without running any of the code it inspects. That makes it safe to plug into CI and local workflows.

The tool targets three ecosystems today: WHMCS modules (PHP), cPanel plugins (Perl), and OpenPanel extensions (Docker and related files). Between them they cover a large share of commercial hosting automation worldwide, yet there is little public tooling that encodes hosting-specific knowledge (deprecated WHMCS APIs, cPanel API migrations, risky container settings, etc.).

HostingLint ships a CLI, an npm library (`@hostinglint/core`), SARIF output for GitHub Code Scanning, configuration and inline suppressions, and today **31** rules across the three platforms. Tests and benchmarks are part of the repo.

With a Commons Fund grant, the expected outcomes are: a significantly larger rule set (50+ rules), cautious auto-fixes where safe, a plugin surface for community rules, stronger documentation and examples, a coordinated security review toward a **v1.0** release, and sustained engagement with developers in the WHMCS, cPanel, and OpenPanel communities. The broader outcome is fewer vulnerable or fragile hosting integrations and clearer upgrade paths as platforms evolve.

---

## Field 2 — Previous involvement (relevant experience)

I have worked hands-on with hosting software: building and maintaining WHMCS modules, cPanel integrations, and automation around billing and provisioning. That background is what motivated HostingLint—most generic linters do not encode the versioned APIs and deployment patterns hosting vendors actually use.

Separately, ModuleForge is a commercial product used to speed up module development; it consumes `@hostinglint/core` for analysis features. HostingLint itself stays open: code, CLI, and library are MIT-licensed on GitHub, with a deliberate boundary so grant-funded work stays in the public codebase.

---

## Field 3 — Requested support / budget (what the money is for)

**Requested amount:** EUR **35,000** (no other funding committed to this project; work to date has been self-funded).

**Rate:** EUR **50** per hour, **700** hours total.

**Use of funds (milestones):**

| Area | Hours | Amount (EUR) | Summary |
|------|------:|-------------:|---------|
| M1 — Rule engine expansion | 120 | 6,000 | Grow toward 50+ rules; PHP/WHMCS/cPanel/OpenPanel coverage; keep performance and tests strong |
| M2 — Auto-fix and plugins | 140 | 7,000 | Safe fixes where possible; plugin API and shared configs for community rules |
| M3 — Developer experience | 100 | 5,000 | Editor/pre-commit ergonomics; clearer feedback loops for authors |
| M4 — Documentation and community | 80 | 4,000 | Docs site, rule examples, migrations, outreach to hosting developers |
| M5 — Security and quality | 80 | 4,000 | Audit coordination; harden outputs and benchmarks |
| M6 — v1.0 and ecosystem | 100 | 5,000 | Stable npm releases, integrations, lightweight governance |
| Project management & reporting | 80 | 4,000 | Milestones, reporting, community support |

**Total:** **700** hours, **EUR 35,000**.

---

## Field 4 — Comparison with existing efforts

| Tool | Focus | Hosting-specific rules |
|------|--------|-------------------------|
| ESLint | JavaScript | No |
| PHPStan / Psalm | PHP generally | No |
| Perl::Critic | Perl generally | No |
| Hadolint | Dockerfiles | No (not WHMCS/cPanel/OpenPanel semantics) |
| **HostingLint** | **WHMCS + cPanel + OpenPanel** | **Yes** |

HostingLint is complementary: it does not replace language-wide analyzers, but adds the cross-version and hosting-domain checks those tools do not model—e.g. WHMCS API deprecations, cPanel API moves, and OpenPanel/Docker foot-guns that matter in hosting deployments.

---

## Field 5 — Technical challenges

1. **One engine, multiple paradigms** — PHP/Perl modules and containerized extensions have different threat models and file types. The analyzer must stay fast, consistent (text/JSON/SARIF), and honest about what regex-based rules can prove.

2. **Version matrices** — PHP, WHMCS, and cPanel versions combine into many target profiles. Rules must be conditional without exploding complexity or slowing scans.

3. **Low false positives** — Pattern matching must respect comments, strings, and context enough to stay trustworthy; that demands systematic tests and tuning.

4. **Auto-fix without a full language AST** — Fixes must be conservative, validated, and scoped so authors can trust `--fix`-style workflows.

5. **Container and extension security** — Beyond generic Dockerfile linting, hosting panels need checks tailored to how extensions are shipped (capabilities, privileges, mounts, resources).

6. **Safe extensibility** — A plugin model must load third-party rules without executing untrusted code; rules stay pure, typed, and sandboxed by design.

---

## Field 6 — Ecosystem and engagement

**Users:** WHMCS module authors, cPanel plugin authors, OpenPanel extension authors, and hosters who maintain in-house integrations.

**Engagement:** npm package and `npx hostinglint` for low-friction trials; GitHub issues and discussions; SARIF for CI; documentation and examples aligned with real modules; participation in hosting and open-source channels; collaboration with downstream tools that embed the library.

**Why this fits NGI / “commons”:** Hosting panels sit in the middle of the stack millions of sites rely on. Making integration code easier to review and harder to get wrong supports a more resilient, trustworthy web—not only for legacy stacks but also for newer container-oriented panels.

**Sustainability:** MIT license, npm distribution, community contributions, and clear governance plans after v1.0. ModuleForge remains one consumer of the library, not the owner of the open project.

---

## GenAI disclosure (form checkbox)

- If you **rewrite** the fields above entirely yourself, you may state that generative AI was **not** used for the **submitted prose**.
- If you keep phrases from assisted drafts, disclose AI use per NLnet’s policy: https://nlnet.nl/foundation/policies/generativeAI/
