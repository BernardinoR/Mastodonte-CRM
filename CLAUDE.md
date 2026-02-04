# Project Rules and Guidelines

> Auto-generated from .context/docs on 2026-02-04T01:17:09.127Z

## README

# Documentation Index

Welcome to the repository knowledge base. This documentation covers the Task Management System - a full-stack application for managing clients, tasks, meetings, and team workflows.

## Core Guides

- [Project Overview](./project-overview.md) - Purpose, goals, and high-level architecture
- [Architecture Notes](./architecture.md) - System layers, patterns, and design decisions
- [Development Workflow](./development-workflow.md) - Branching, CI/CD, and contribution guidelines
- [Testing Strategy](./testing-strategy.md) - Test configurations and quality gates
- [Glossary & Domain Concepts](./glossary.md) - Business terminology and domain rules
- [Data Flow & Integrations](./data-flow.md) - How data moves through the system
- [Security & Compliance Notes](./security.md) - Authentication, authorization, and security model
- [Tooling & Productivity Guide](./tooling.md) - CLI scripts and IDE configurations

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express |
| Database | PostgreSQL with Prisma ORM |
| Authentication | Clerk |
| Styling | shadcn/ui components |

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `client/` | React frontend application |
| `server/` | Express backend API |
| `prisma/` | Database schema and migrations |
| `attached_assets/` | Static assets and resources |

## Quick Links

- **Entry Points**: [`server/app.ts`](../server/app.ts), [`client/src/main.tsx`](../client/src/main.tsx)
- **API Routes**: [`server/routes.ts`](../server/routes.ts)
- **Database Schema**: [`prisma/schema.prisma`](../prisma/schema.prisma)

## Key Features

- **Task Management**: Create, assign, track, and complete tasks with priority and status tracking
- **Client Management**: Manage client information, contacts, and relationships
- **Meeting Scheduling**: Schedule and track meetings with AI-powered summaries
- **User Roles**: Admin, manager, and user role-based access control
- **Turbo Mode**: Fast task processing workflow for bulk operations
- **WhatsApp Integration**: Link tasks to WhatsApp groups for communication tracking

## Document Map

| Guide | File | Primary Inputs |
|-------|------|----------------|
| Project Overview | `project-overview.md` | Roadmap, README, stakeholder notes |
| Architecture Notes | `architecture.md` | ADRs, service boundaries, dependency graphs |
| Development Workflow | `development-workflow.md` | Branching rules, CI config, contributing guide |
| Testing Strategy | `testing-strategy.md` | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | `glossary.md` | Business terminology, user personas, domain rules |
| Data Flow & Integrations | `data-flow.md` | System diagrams, integration specs |
| Security & Compliance Notes | `security.md` | Auth model, secrets management |
| Tooling & Productivity Guide | `tooling.md` | CLI scripts, IDE configs |

