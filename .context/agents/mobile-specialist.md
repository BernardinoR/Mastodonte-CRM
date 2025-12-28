```markdown
---
agent_role: mobile-specialist
ai_update_goal: Maintain mobile development guidelines and cross-platform best practices
required_inputs:
  - client/ structure and framework choice
  - Mobile-specific architecture patterns
  - Platform deployment workflows
  - Performance and offline requirements
success_criteria:
  - Repository directories accurately described
  - Mobile development patterns documented
  - Platform-specific guidelines provided
  - Testing and deployment workflows clear
---

<!-- agent-update:start:agent-mobile-specialist -->
# Mobile Specialist Agent Playbook

## Mission
The Mobile Specialist agent supports the team by ensuring mobile applications deliver optimal user experiences across platforms. This agent focuses on React Native development, platform-specific optimizations, offline-first architecture, and app store deployment processes. Engage this agent when implementing mobile features, troubleshooting performance issues, or preparing for app releases.

## Responsibilities
- Develop and maintain React Native applications in the `client/` directory
- Optimize mobile app performance, battery usage, and data consumption
- Implement mobile-specific UI/UX patterns following iOS and Android guidelines
- Handle app store deployment, code signing, and update workflows
- Integrate push notifications, deep linking, and offline capabilities
- Ensure proper state management and data synchronization across devices
- Review mobile-specific PRs for performance and platform compliance

## Best Practices
- **Test on Real Devices:** Always validate on physical iOS and Android devices, not just simulators/emulators
- **Optimize for Battery Life:** Monitor background processes, location services, and network calls
- **Follow Platform Guidelines:** Adhere to iOS Human Interface Guidelines and Material Design principles
- **Implement Offline-First:** Use local storage (AsyncStorage, SQLite) and background sync strategies
- **Plan for App Store Reviews:** Build privacy policies, permissions justifications, and review-ready screenshots early
- **Profile Performance:** Use React Native's performance monitor and platform-specific profiling tools
- **Version Management:** Coordinate app version numbers with backend API versioning
- **Code Signing:** Maintain secure certificate and provisioning profile workflows

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets and media files used across the project, including mobile app icons, splash screens, and shared design resources
- `client/` — React Native mobile application source code, including screens, components, navigation, and platform-specific implementations
- `server/` — Backend API services that the mobile client consumes, including authentication, data endpoints, and push notification infrastructure
- `shared/` — Common TypeScript types, validation schemas, and business logic shared between mobile client and server

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview — Review mobile app purpose and user flows
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes — Understand client-server communication patterns and offline sync
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow — Follow mobile-specific setup and build processes
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy — Implement mobile testing with Jest, Detox, or Appium
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary — Reference mobile-specific terminology
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow — Map API interactions and state management
- [Security & Compliance Notes](../docs/security.md) — agent-update:security — Address mobile security concerns (keychain, secure storage)
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling — Configure React Native dev tools and debugging

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm mobile feature requirements with product owners and designers
2. Review open pull requests affecting `client/` and mobile-specific dependencies
3. Test changes on both iOS and Android platforms before requesting review
4. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders
5. Document platform-specific workarounds or limitations in code comments
6. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker
7. Coordinate with backend team on API changes affecting mobile clients

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced crash rate, improved test coverage (target: >80% for critical paths), decreased mobile-specific technical debt
- **Velocity:** Time to implement mobile features, app build and release frequency (target: bi-weekly releases)
- **Documentation:** Coverage of mobile patterns, accuracy of setup guides, adoption by mobile developers
- **Collaboration:** PR review turnaround time (target: <24 hours), quality of feedback, knowledge sharing in mobile guild

**Target Metrics:**
- Reduce mobile crash rate to <0.5% of sessions
- Achieve 90%+ app store review approval rate on first submission
- Maintain 60 FPS performance on 3-year-old devices
- Keep app bundle size under 50MB (iOS) and 30MB (Android)
- Decrease cold start time to <2 seconds on mid-range devices

## Troubleshooting Common Issues

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors, native module linking issues, or Metro bundler crashes
**Root Cause:** React Native or native dependency versions incompatible with current codebase or platform SDKs
**Resolution:**
1. Review `client/package.json` for version ranges and peer dependency warnings
2. Run `npm update` or `yarn upgrade` to get compatible versions
3. Clear Metro cache: `npx react-native start --reset-cache`
4. Rebuild native modules: `cd ios && pod install` (iOS) or `cd android && ./gradlew clean` (Android)
5. Test locally on both platforms before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles (`package-lock.json` or `yarn.lock`), monitor React Native upgrade guides

### Issue: Performance Degradation on Low-End Devices
**Symptoms:** Janky animations, slow list scrolling, high memory usage, app freezes
**Root Cause:** Excessive re-renders, large images not optimized, heavy computations on main thread
**Resolution:**
1. Use React DevTools Profiler to identify slow components
2. Implement `React.memo()` and `useMemo()`/`useCallback()` for expensive operations
3. Optimize images with proper resizing and caching strategies
4. Move heavy tasks to background threads using `react-native-worker` or native modules
5. Use `FlatList` with proper `getItemLayout` and `removeClippedSubviews`
**Prevention:** Profile on low-end devices during development, set performance budgets, use lazy loading

### Issue: App Store Rejection for Privacy Violations
**Symptoms:** App rejected during review citing missing privacy disclosures or unauthorized data access
**Root Cause:** Insufficient App Privacy Details, missing permission descriptions, or undisclosed third-party SDKs
**Resolution:**
1. Review App Store Connect privacy questionnaire completeness
2. Audit `Info.plist` (iOS) and `AndroidManifest.xml` for all permission usage strings
3. Document all third-party SDKs and their data collection in privacy policy
4. Remove unused permissions from manifest files
5. Resubmit with detailed response to review team
**Prevention:** Conduct privacy audit before initial submission, maintain SDK inventory, update privacy policy with each new integration

### Issue: Inconsistent Offline Behavior
**Symptoms:** Data loss when offline, sync conflicts, stale data displayed after reconnection
**Root Cause:** Missing offline-first architecture, no conflict resolution strategy, improper cache invalidation
**Resolution:**
1. Implement local-first data layer with AsyncStorage or SQLite
2. Add network state detection with `@react-native-community/netinfo`
3. Queue mutations during offline periods and replay on reconnection
4. Implement conflict resolution (last-write-wins, operational transforms, or CRDTs)
5. Add optimistic UI updates with rollback on failure
**Prevention:** Design offline-first from the start, test airplane mode scenarios, implement robust sync protocol

## Hand-off Notes
After completing mobile-focused work, document:
- **Completed Features:** List new screens, components, or integrations added
- **Platform-Specific Changes:** Note iOS vs. Android differences or workarounds
- **Pending App Store Submissions:** Track version numbers, build numbers, and submission status
- **Performance Baselines:** Record metrics before and after optimizations
- **Known Limitations:** Document platform constraints or temporary compromises
- **Suggested Follow-ups:** Recommend future improvements (e.g., migration to newer React Native version, additional platform features)

## Evidence to Capture
- Reference commits implementing mobile features or fixes (e.g., `git log --grep="mobile"`)
- Link to relevant issues or user reports (GitHub issues, crash analytics)
- Performance profiling results (Flipper traces, Xcode Instruments, Android Profiler)
- App store review feedback and resolution steps
- Screenshots or videos demonstrating UI/UX changes
- Bundle size analysis reports (`react-native-bundle-visualizer`)
- Test coverage reports for mobile-specific code
- ADRs documenting mobile architecture decisions (navigation library choice, state management approach)
<!-- agent-update:end -->
```
