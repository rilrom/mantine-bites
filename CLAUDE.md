# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mantine bites is a monorepo containing bite-sized Mantine extensions. Each extension is published as an independent npm package under `@mantine-bites/*`. Extensions should leverage as much of the existing Mantine API as possible (styles API, factory pattern, theme integration, etc.) rather than reinventing functionality.

**Current packages:**
- `example` - Template package demonstrating conventions for new extensions

## Monorepo Structure

This is a pnpm workspace managed by Turbo:

```
mantine-bites/
├── apps/
│   ├── docs/        # Next.js documentation site
│   └── storybook/   # Storybook component showcase
├── packages/
│   ├── example/            # Template extension package
│   ├── rollup-config/      # Shared Rollup build configuration
│   └── typescript-config/  # Shared TypeScript configurations
└── scripts/
    ├── generate-dts.ts     # Generate type definitions post-build
    └── prepare-css.ts      # Prepare CSS outputs (styles.css + styles.layer.css)
```

## Development Commands

### Root-level commands (uses Turbo)
- `pnpm dev` - Run dev mode across all apps
- `pnpm dev:storybook` - Run Storybook dev server
- `pnpm dev:docs` - Run docs site dev server
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages (Biome + Stylelint)
- `pnpm tsc` - Type check all packages
- `pnpm docgen` - Generate documentation
- `pnpm clean` - Clean build artifacts

### Individual package scripts
Within `packages/*/`:
- `pnpm build` - Rollup build (ESM + CJS + types + CSS)
- `pnpm test` - Run Jest tests
- `pnpm lint` - Run Biome and Stylelint
- `pnpm tsc` - Type check without emit

## Package Architecture

### Standard package structure
```
packages/PACKAGE_NAME/
├── src/
│   ├── index.ts                    # Barrel exports (types + components)
│   ├── ComponentName.tsx           # Component implementation
│   ├── ComponentName.module.css    # CSS module styles
│   ├── ComponentName.test.tsx      # Tests
│   └── ComponentName.story.tsx     # Storybook stories
├── package.json
├── rollup.config.ts
├── jest.config.cjs
├── jsdom.mocks.cjs
├── tsconfig.json
└── global.d.ts
```

### Component implementation pattern

All extensions follow the Mantine factory pattern:

```typescript
import {
  Box,
  type BoxProps,
  type ElementProps,
  factory,
  type Factory,
  getThemeColor,
  type MantineColor,
  type StylesApiProps,
  useProps,
  useStyles,
  createVarsResolver,
} from "@mantine/core";
import classes from "./ComponentName.module.css";

// Define styles API selectors
export type ComponentNameStylesNames = "root";

// Define CSS variables mapping
export type ComponentNameCssVariables = {
  root: "--component-name-color";
};

// Props extend BoxProps + StylesApiProps + native element props
export interface ComponentNameProps
  extends BoxProps,
    StylesApiProps<ComponentNameFactory>,
    ElementProps<"div"> {
  /** JSDoc description, `'default value'` by default */
  label?: React.ReactNode;
  /** Controls `background-color`, key of `theme.colors` or any valid CSS color, `theme.primaryColor` by default */
  color?: MantineColor;
}

export type ComponentNameFactory = Factory<{
  props: ComponentNameProps;
  ref: HTMLDivElement;
  stylesNames: ComponentNameStylesNames;
  vars: ComponentNameCssVariables;
}>;

const defaultProps: Partial<ComponentNameProps> = {};

const varsResolver = createVarsResolver<ComponentNameFactory>(
  (theme, { color }) => ({
    root: {
      "--component-name-color": getThemeColor(color, theme),
    },
  }),
);

export const ComponentName = factory<ComponentNameFactory>((_props, ref) => {
  const props = useProps("ComponentName", defaultProps, _props);
  const { classNames, className, style, styles, unstyled, vars, ...others } =
    props;

  const getStyles = useStyles<ComponentNameFactory>({
    name: "ComponentName",
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  return <Box ref={ref} {...getStyles("root")} {...others} />;
});

ComponentName.displayName = "ComponentName";
ComponentName.classes = classes;
```

### CSS module conventions
- Use `.root` as the primary class selector
- Reference Mantine CSS variables: `var(--mantine-spacing-md)`, `var(--mantine-radius-md)`, `var(--mantine-color-white)`
- Use component-scoped CSS variables: `var(--component-name-color)`
- Class selectors must use camelCase

### Export conventions
```typescript
// index.ts - explicit named exports with .js extensions
export type {
  ComponentNameCssVariables,
  ComponentNameFactory,
  ComponentNameProps,
  ComponentNameStylesNames,
} from "./ComponentName.js";

export { ComponentName } from "./ComponentName.js";
```

### Package exports (package.json)
Packages provide dual ESM/CJS output with separate CSS entry points:
```json
{
  "exports": {
    ".": {
      "import": { "types": "./dist/types/index.d.mts", "default": "./dist/esm/index.mjs" },
      "require": { "types": "./dist/types/index.d.ts", "default": "./dist/cjs/index.cjs" }
    },
    "./styles.css": "./dist/styles.css",
    "./styles.layer.css": "./dist/styles.layer.css"
  }
}
```

### JSDoc style
Follow the Mantine convention for prop documentation:
```typescript
/** Label displayed inside the component, `'Test component'` by default */
label?: React.ReactNode;
```

## Build System

### Rollup
Packages use a shared Rollup config (`@mantine-bites/rollup-config`):
- **Input**: `./src/index.ts`
- **ESM output**: `dist/esm/*.mjs`
- **CJS output**: `dist/cjs/*.cjs`
- PostCSS with CSS modules (scoped with `"me"` prefix)
- `'use client'` banner added to all chunks except index
- Sourcemaps enabled

### Build pipeline
1. Rollup bundles ESM and CJS with CSS extraction
2. `generate-dts.ts` generates `.d.ts` and `.d.mts` type definitions
3. `prepare-css.ts` moves CSS to `dist/styles.css` and creates `dist/styles.layer.css` (wrapped in `@layer mantine`)

### TypeScript configuration
All packages extend `@mantine-bites/typescript-config/react-library.json`:
- Target: ES2022
- Module: NodeNext
- Strict mode enabled
- `noUncheckedIndexedAccess: true`
- JSX: react-jsx
- Declarations with declaration maps

## Testing

Uses Jest with Testing Library. Tests must pass before creating a PR.

### Running tests
```bash
# Run all tests for a specific package
pnpm test --filter @mantine-bites/PACKAGE_NAME

# Run all tests across all packages
pnpm test
```

### Test structure
Tests are co-located with source files (`ComponentName.test.tsx`).

```typescript
import { render, screen, tests } from "@mantine-tests/core";

const defaultProps: ComponentNameProps = {};

describe("@mantine/core/ComponentName", () => {
  tests.itSupportsSystemProps<ComponentNameProps, ComponentNameStylesNames>({
    component: ComponentName,
    props: defaultProps,
    polymorphic: true,
    styleProps: true,
    extend: true,
    variant: true,
    size: true,
    classes: true,
    refType: HTMLDivElement,
    displayName: "ComponentName",
    stylesApiSelectors: ["root"],
  });

  it("renders without crashing", () => {
    render(<ComponentName label="test-label" />);
    expect(screen.getByText("test-label")).toBeInTheDocument();
  });
});
```

### When to add tests
- Bug fixes should include a test that reproduces the bug
- New features should include tests for the core functionality
- Use `@mantine-tests/core` system prop tests for all new components
- Accessibility tests via jest-axe when applicable

## Code Quality

- **Linting**: Biome handles JS/TS, Stylelint handles CSS modules. Both must pass with zero errors (warnings acceptable when appropriate)
- **Formatting**: Biome formats on save (VSCode settings provided)
- **Editor**: 2-space indentation, double quotes, LF line endings

## Environment & Requirements

- **Node**: >= 22
- **pnpm**: ^10.19.0 (enable via `corepack enable`)

## Version Control

Uses Conventional Commits for PR titles:
- `feat(package-name): description` - New feature
- `fix(package-name): description` - Bug fix
- `chore: description` - Maintenance (unscoped)

All commits in a PR are squashed using the PR title as the commit message.

### Before creating a PR
- All tests must pass (`pnpm test`)
- Linting must pass (`pnpm lint`)
- Type checking must pass (`pnpm tsc`)
- Add tests for new functionality or bug fixes when reasonable
