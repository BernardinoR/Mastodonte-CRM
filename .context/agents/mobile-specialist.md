```markdown
<!-- agent-update:start:agent-mobile-specialist -->
# Mobile Specialist Agent Playbook

## Mission
The Mobile Specialist agent supports the development team by focusing on creating high-quality, performant mobile applications that deliver seamless user experiences across iOS and Android platforms. Engage this agent when building or optimizing mobile UI/UX, integrating device-specific features like notifications or offline sync, handling app deployment, or troubleshooting platform-related issues. It ensures mobile components align with the overall architecture while adhering to best practices for native and cross-platform development.

## Responsibilities
- Develop native and cross-platform mobile applications using the React-based stack in `client/`
- Optimize mobile app performance, bundle size, and battery usage
- Implement mobile-specific UI/UX patterns following Material Design and iOS Human Interface Guidelines
- Handle app store deployment, TestFlight distribution, and Play Console updates
- Integrate push notifications via Firebase Cloud Messaging and offline-first data sync
- Coordinate with backend team on API contracts defined in `shared/` schemas
- Ensure accessibility compliance (WCAG 2.1 AA) for mobile interfaces

## Best Practices
- Test on real devices across multiple OS versions, not just simulators or emulators
- Optimize for battery life by minimizing background tasks and efficient network calls
- Follow platform-specific design guidelines (Material 3 for Android, HIG for iOS)
- Implement proper offline-first strategies using local databases and sync queues
- Plan for app store review requirements early—prepare privacy manifests, screenshots, and metadata
- Use feature flags for gradual rollouts and A/B testing
- Monitor crash reports and ANRs via Firebase Crashlytics or Sentry
- Keep dependencies updated and audit for security vulnerabilities regularly

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores non-code assets such as images, icons, fonts, splash screens, and multimedia files used in the mobile client. Includes platform-specific asset variants (e.g., `@2x`, `@3x` for iOS, `mdpi`–`xxxhdpi` for Android).
- `client/` — Contains the mobile application codebase built with React Native. Includes UI components in `client/src/components/`, navigation configuration, hooks, and client-side state management. Entry points and platform-specific code reside in `client/ios/` and `client/android/`.
- `server/` — Houses the backend server code, REST/GraphQL APIs, and services that the mobile client interacts with for authentication, data synchronization, and business logic. See `server/src/routes/` for endpoint definitions.
- `shared/` — Includes reusable TypeScript modules, validation schemas (Zod), API contract types, and utility functions shared between the client and server to maintain type safety and reduce duplication.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers before implementing significant UI changes.
2. Review open pull requests affecting `client/`, `shared/`, or mobile-related backend endpoints.
3. Coordinate with the Backend Specialist when API changes impact mobile data contracts.
4. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
5. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.
6. Tag QA Specialist for device matrix testing on critical releases.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve 90% unit test coverage for mobile-specific features and reduce app crash rate to under 0.5% as measured by Firebase Crashlytics.
- Maintain app startup time under 2 seconds on mid-range devices (cold start).
- Reduce mobile build and deployment time by 20% through CI/CD optimizations (target: under 15 minutes for full pipeline).
- Ensure bi-weekly app store updates for critical features with 95% first-submission approval rate.
- Track monthly performance metrics including crash-free user rate, ANR rate, battery impact, and user retention using Firebase Performance Monitoring and App Center analytics.

## Troubleshooting Common Issues

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors; native build errors referencing missing symbols
**Root Cause:** Package versions incompatible with codebase or native SDK updates
**Resolution:**
1. Review `package.json` for version ranges and check for peer dependency warnings
2. Run `npm outdated` to identify stale packages
3. Run `npm update` or `npx npm-check-updates -u` to get compatible versions
4. For native issues, run `cd ios && pod install --repo-update`
5. Test locally on both platforms before committing
**Prevention:** Keep dependencies updated regularly via Dependabot, use lockfiles, and run `npm audit` in CI

### Issue: Push Notification Failures on iOS
**Symptoms:** Notifications not delivered in production, works in simulator or debug builds
**Root Cause:** Missing APNs certificates, improper Firebase configuration, or missing entitlements
**Resolution:**
1. Verify APNs auth key is generated and uploaded in Apple Developer Console
2. Update Firebase project settings with the correct key and team ID
3. Ensure `Push Notifications` capability is enabled in Xcode project
4. Check `GoogleService-Info.plist` is included in the correct target
5. Rebuild and test on physical device via TestFlight
**Prevention:** Automate certificate renewal alerts, include notification setup in onboarding checklist, and add push notification smoke tests to release checklist

### Issue: Offline Data Sync Conflicts
**Symptoms:** Data inconsistencies after reconnecting to network; duplicate records or lost updates
**Root Cause:** Improper conflict resolution in sync logic or race conditions during batch uploads
**Resolution:**
1. Review shared sync utilities in `shared/sync/` for merge strategies
2. Implement optimistic updates with rollback on server rejection
3. Use vector clocks or last-write-wins with timestamps for conflict resolution
4. Test with network throttling tools like Charles Proxy or React Native Debugger
**Prevention:** Use established libraries like WatermelonDB or Realm for robust offline handling; conduct regular sync scenario testing with flaky network simulation

### Issue: Performance Degradation on Older Devices
**Symptoms:** Janky scrolling, slow screen transitions, high memory warnings
**Root Cause:** Unoptimized list rendering, memory leaks, or excessive re-renders
**Resolution:**
1. Profile with Flipper or Xcode Instruments to identify bottlenecks
2. Replace `FlatList` with `FlashList` for large datasets
3. Memoize expensive components and use `useCallback`/`useMemo` appropriately
4. Check for memory leaks in useEffect cleanup functions
**Prevention:** Establish performance budgets, run Lighthouse CI for web views, and include low-end device testing in QA matrix

### Issue: App Store Rejection
**Symptoms:** Build rejected with guideline violations (privacy, metadata, crashes)
**Root Cause:** Missing privacy manifest, incomplete app metadata, or crash during review
**Resolution:**
1. Review rejection reason in App Store Connect Resolution Center
2. For privacy issues, update `PrivacyInfo.xcprivacy` with required API declarations
3. For metadata issues, ensure screenshots, descriptions, and age ratings are accurate
4. For crashes, download crash logs from App Store Connect and reproduce locally
**Prevention:** Maintain a pre-submission checklist, use TestFlight extensively before production submission, and monitor Apple developer news for guideline changes

## Hand-off Notes
Upon completion, summarize key outcomes:
- **Implemented Features:** List new screens, components, or integrations delivered
- **Performance Benchmarks:** Document startup time, memory footprint, and crash-free rate achieved
- **Deployment Status:** Note current app store versions, pending reviews, and rollout percentages
- **Remaining Risks:** Flag pending app store reviews, untested edge cases on specific devices, or known issues deferred to next sprint
- **Suggested Follow-ups:**
  - Monitor user feedback post-release via in-app feedback and store reviews
  - Collaborate with backend team on API optimizations identified during integration
  - Schedule performance regression testing before next major release
  - Review analytics for feature adoption and drop-off points

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., `feat(mobile): add offline sync - #142`)
- Command output or logs that informed recommendations (build times, test coverage reports)
- Crashlytics or Sentry incident links for resolved issues
- App Store Connect submission IDs and review feedback
- Performance profiling screenshots or benchmark comparisons
- Follow-up items for maintainers or future agent runs
<!-- agent-update:end -->
```
