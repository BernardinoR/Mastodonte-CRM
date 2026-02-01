# Mobile Specialist Agent Playbook

## Mission

The Mobile Specialist agent ensures the Task Management System works well on mobile devices. Engage this agent for responsive design, touch interactions, and mobile-specific optimizations.

## Responsibilities

- Ensure responsive design across devices
- Optimize touch interactions
- Handle mobile-specific UI patterns
- Test on various screen sizes
- Optimize performance for mobile
- Implement mobile-friendly navigation

## Best Practices

- Use responsive Tailwind utilities
- Test on multiple device sizes
- Optimize for touch targets (44px minimum)
- Consider mobile-first design
- Handle mobile viewport issues
- Optimize images and assets for mobile

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/shared/components/` - UI components
- `client/src/features/*/components/` - Feature components
- `tailwind.config.ts` - Responsive breakpoints

## Key Files

- [`tailwind.config.ts`](../../tailwind.config.ts) - Tailwind configuration
- [`client/src/shared/components/ui/`](../../client/src/shared/components/ui/) - UI components

## Key Symbols for This Agent

- `cn` @ `client/src/shared/lib/utils.ts` - Responsive class handling
- UI components in `client/src/shared/components/ui/`

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Tooling Guide](../docs/tooling.md)

## Collaboration Checklist

- [ ] Test on multiple screen sizes
- [ ] Verify touch interactions work
- [ ] Check responsive breakpoints
- [ ] Optimize for mobile performance
- [ ] Test mobile navigation

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
