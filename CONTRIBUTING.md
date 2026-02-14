# Contributing to Mantine bites

Below you'll find a set of guidelines for how to contribute to Mantine bites.

## Opening issues

Before you submit an issue, please check all existing [open and closed issues](https://github.com/rilrom/mantine-bites/issues) to see if your issue has previously been resolved or is already known.

If there is already an issue logged, feel free to upvote it by adding a :thumbsup: [reaction](https://github.com/blog/2119-add-reactions-to-pull-requests-issues-and-comments).

If you would like to submit a new issue, please provide as much information as possible to give me the best chance to help you in resolving it.

## Security issues & vulnerabilities

If you come across an issue related to security, or a potential attack vector within one of the Mantine bites packages, please DO NOT create a publicly viewable issue. Instead, please contact me directly at [`rilrom-dev@protonmail.com`](mailto:rilrom-dev@protonmail.com). I will do everything I can to respond to the issue as soon as possible.

## Creating new features or fixing bugs

I welcome any contribution towards new features of bug fixes, any help is greatly appreciated.

### Before starting

To help me work on new features, you can create a new feature request post in [GitHub discussions](https://github.com/rilrom/mantine-bites/discussions) where we can discuss the architecture and approach before you get started on a pull request.

### Installation & requirements

Mantine bites is structured as a monorepo. To install all required dependencies, you have to run `pnpm install` once in the root directory. Please note that pnpm is required, yarn or npm will not work. In most systems, the easiest way to install pnpm is to run `corepack enable` in your terminal.

Node v22 or higher is required. You can check your current node version by typing `node --version` in your terminal. The easiest way to switch between different node versions is to use [nvm](https://github.com/nvm-sh/nvm#intro).

### Development

There are convenience scripts available for developing each app. Run from the root of the project:

```bash
# Run the Storybook dev server
pnpm dev:storybook

# Run the docs site dev server
pnpm dev:docs
```

Alternatively, you can use Turbo filters directly:

```bash
pnpm dev --filter storybook --filter docs
```

I recommend using vscode to take advantage of the pre-configured settings provided for this project in the `.vscode` folder. This will handle any linting and formatting for you automatically as you work.

You must ensure that formatting and linting has been addressed prior to submitting a PR. I will accept Biome warnings when appropriate but will not accept new Biome errors or new Stylelint errors.

### Testing

This project uses Jest and Testing Library for unit tests, along with jest-axe for accessibility testing. Tests must pass before creating a PR, and you should add tests when making changes that can be reasonably tested.

**Running tests:**

```bash
# Run all tests for a specific package
pnpm test --filter @mantine-bites/PACKAGE_NAME

# Run all tests across all packages
pnpm test
```

**When to add tests:**

- Bug fixes should include a test that reproduces the bug
- New features should include tests for the core functionality
- Accessibility tests should be included for any new components

### Storybook

All components should have corresponding Storybook stories. Stories serve as both documentation and a development environment for your components.

Story files should be co-located with their component source (e.g., `MyComponent.story.tsx` alongside `MyComponent.tsx`).

### Pull requests

For all pull requests, you should be extremely descriptive about both your problem and proposed solution. If there are any affected open or closed issues, please leave the issue number in your PR description.

All commits within a PR are squashed when merged, using the PR title as the commit message. For that reason, please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for your PR titles.

Here are some examples:

- `feat: add new feature`
- `fix: fix bug`
- `chore: anything that does not fit into the above categories`

If applicable, you must indicate the affected packages in parentheses to "scope" the changes. Changes that do not affect any specific packages do not require scoping.

Here are some examples:

- `feat(example): add new feature`
- `fix(example): fix bug`
- `chore: upgrade dependencies`
