# @mantine-bites/lightbox

## 1.1.0

### Minor Changes

- feat: add thumbnail src and alt to convenience component ([59c41ba](https://github.com/rilrom/mantine-bites/commit/59c41ba))
- feat: Mantine image used in convenience component by default ([b45cd0b](https://github.com/rilrom/mantine-bites/commit/b45cd0b))

## 1.0.0

### Major Changes

- feat: lightbox stable release

### Patch Changes

- fix: update index on reinit ([831fae7](https://github.com/rilrom/mantine-bites/commit/831fae7))

## 1.0.0-beta.10

### Minor Changes

- feat!: compound component restructure ([36c5191](https://github.com/rilrom/mantine-bites/commit/36c5191))

### BREAKING CHANGES

- Plugin structure was completely re-written, too many changes to list here. I highly recommend checking out the [documentation](https://rilrom.github.io/mantine-bites/lightbox) before upgrading. This should be the final re-write before being marked as stable.

### Patch Changes

- fix: ensure whole image is in viewport before zooming ([4ccaccf](https://github.com/rilrom/mantine-bites/commit/4ccaccf))
- refactor: remove useCarouselOptions ([5aa9bc9](https://github.com/rilrom/mantine-bites/commit/5aa9bc9))
- refactor: replace useKeyboardNavigation with useHotkeys ([f24045f](https://github.com/rilrom/mantine-bites/commit/f24045f))
- fix: correct types for portalProps and transitionProps ([1471620](https://github.com/rilrom/mantine-bites/commit/1471620))
- refactor: switch to @mantine/hooks useFullscreen ([74038cf](https://github.com/rilrom/mantine-bites/commit/74038cf))
- refactor: ctx and props consistency ([68a3478](https://github.com/rilrom/mantine-bites/commit/68a3478))
- refactor: create LightboxCounter component ([a213dbb](https://github.com/rilrom/mantine-bites/commit/a213dbb))

## 1.0.0-beta.9

### Patch Changes

- fix: disable zoom when useZoom: false ([d789cb1](https://github.com/rilrom/mantine-bites/commit/d789cb1))

## 1.0.0-beta.8

### Minor Changes

- feat: zoom towards click position on image ([cced240](https://github.com/rilrom/mantine-bites/commit/cced240))
- feat: thumbnail carousel ([611aac8](https://github.com/rilrom/mantine-bites/commit/611aac8))

### Patch Changes

- fix: stop autoplay on zoom button click ([f875b29](https://github.com/rilrom/mantine-bites/commit/f875b29))

## 1.0.0-beta.7

### Minor Changes

- feat: improve autoplay option ([4999462](https://github.com/rilrom/mantine-bites/commit/4999462))

## 1.0.0-beta.6

### Minor Changes

- feat!: replace modal dep with portal/overlay dep for flexibility ([2ab8339](https://github.com/rilrom/mantine-bites/commit/2ab8339))
- feat: implement closeOnClickOutside ([e9485a5](https://github.com/rilrom/mantine-bites/commit/e9485a5))

#### BREAKING CHANGES

- `modalOptions` was removed and replaced with top-level props such as `overlayProps` and `transitionProps`.

### Patch Changes

- refactor: improve code structure ([847bf72](https://github.com/rilrom/mantine-bites/commit/847bf72))
- fix: update counter color variable ([2714127](https://github.com/rilrom/mantine-bites/commit/2714127))
- fix: add missing LightboxCssVariables type ([6a96ecf](https://github.com/rilrom/mantine-bites/commit/6a96ecf))
- refactor: use context for getStyles ([9aeb948](https://github.com/rilrom/mantine-bites/commit/9aeb948))
- refactor: improve slides types ([dda5939](https://github.com/rilrom/mantine-bites/commit/dda5939))
- refactor: add missing output types to some hooks ([ea6621e](https://github.com/rilrom/mantine-bites/commit/ea6621e))
- refactor: migrate prop drilling to context ([b295575](https://github.com/rilrom/mantine-bites/commit/b295575))
- refactor: improve code and consumer docs ([7599136](https://github.com/rilrom/mantine-bites/commit/7599136))

## 1.0.0-beta.5

### Minor Changes

- feat: fullscreen option ([57b64c3](https://github.com/rilrom/mantine-bites/commit/57b64c3))
- feat: zoom option ([ae29cce](https://github.com/rilrom/mantine-bites/commit/ae29cce))

### Patch Changes

- refactor: move svgs to separate files ([f4aa8b8](https://github.com/rilrom/mantine-bites/commit/f4aa8b8))

## 1.0.0-beta.4

### Minor Changes

- feat: improve image loading handling ([e387590](https://github.com/rilrom/mantine-bites/commit/e387590))
- feat: update base thumbnail size ([0485f23](https://github.com/rilrom/mantine-bites/commit/0485f23))

## 1.0.0-beta.3

### Minor Changes

- feat!: full rewrite ([952ff5b](https://github.com/rilrom/mantine-bites/commit/952ff5b))

#### BREAKING CHANGES

- Plugin structure was completely re-written, too many changes to list here. I highly recommend checking out the [documentation](https://rilrom.github.io/mantine-bites/lightbox) before upgrading.

## 1.0.0-beta.2

### Patch Changes

- fix: mobile browser vertical overflow ([4f3794c](https://github.com/rilrom/mantine-bites/commit/4f3794c))

## 1.0.0-beta.1

### Major Changes

- feat: lightbox beta release ([5ecde20](https://github.com/rilrom/mantine-bites/commit/5ecde20))
