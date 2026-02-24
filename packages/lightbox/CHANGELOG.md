# @mantine-bites/lightbox

## 1.0.0-beta.9

### Patch Changes

- fix: disable zoom when useZoom: false ([d789cb1](https://github.com/rilrom/payload-bites/commit/d789cb1))

## 1.0.0-beta.8

### Minor Changes

- feat: zoom towards click position on image ([cced240](https://github.com/rilrom/payload-bites/commit/cced240))
- feat: thumbnail carousel ([611aac8](https://github.com/rilrom/payload-bites/commit/611aac8))

### Patch Changes

- fix: stop autoplay on zoom button click ([f875b29](https://github.com/rilrom/payload-bites/commit/f875b29))

## 1.0.0-beta.7

### Minor Changes

- feat: improve autoplay option ([4999462](https://github.com/rilrom/payload-bites/commit/4999462))

## 1.0.0-beta.6

### Minor Changes

- feat!: replace modal dep with portal/overlay dep for flexibility ([2ab8339](https://github.com/rilrom/payload-bites/commit/2ab8339))
- feat: implement closeOnClickOutside ([e9485a5](https://github.com/rilrom/payload-bites/commit/e9485a5))

#### BREAKING CHANGES

- `modalOptions` was removed and replaced with top-level props such as `overlayProps` and `transitionProps`.

### Patch Changes

- refactor: improve code structure ([847bf72](https://github.com/rilrom/payload-bites/commit/847bf72))
- fix: update counter color variable ([2714127](https://github.com/rilrom/payload-bites/commit/2714127))
- fix: add missing LightboxCssVariables type ([6a96ecf](https://github.com/rilrom/payload-bites/commit/6a96ecf))
- refactor: use context for getStyles ([9aeb948](https://github.com/rilrom/payload-bites/commit/9aeb948))
- refactor: improve slides types ([dda5939](https://github.com/rilrom/payload-bites/commit/dda5939))
- refactor: add missing output types to some hooks ([ea6621e](https://github.com/rilrom/payload-bites/commit/ea6621e))
- refactor: migrate prop drilling to context ([b295575](https://github.com/rilrom/payload-bites/commit/b295575))
- refactor: improve code and consumer docs ([7599136](https://github.com/rilrom/payload-bites/commit/7599136))

## 1.0.0-beta.5

### Minor Changes

- feat: fullscreen option ([57b64c3](https://github.com/rilrom/payload-bites/commit/57b64c3))
- feat: zoom option ([ae29cce](https://github.com/rilrom/payload-bites/commit/ae29cce))

### Patch Changes

- refactor: move svgs to separate files ([f4aa8b8](https://github.com/rilrom/payload-bites/commit/f4aa8b8))

## 1.0.0-beta.4

### Minor Changes

- feat: improve image loading handling ([e387590](https://github.com/rilrom/payload-bites/commit/e387590))
- feat: update base thumbnail size ([0485f23](https://github.com/rilrom/payload-bites/commit/0485f23))

## 1.0.0-beta.3

### Minor Changes

- feat!: full rewrite ([952ff5b](https://github.com/rilrom/payload-bites/commit/952ff5b))

#### BREAKING CHANGES

- Plugin structure was completely re-written, too many changes to list here. I highly recommend checking out the [documentation](https://rilrom.github.io/mantine-bites/lightbox) before upgrading.

## 1.0.0-beta.2

### Patch Changes

- fix: mobile browser vertical overflow ([4f3794c](https://github.com/rilrom/payload-bites/commit/4f3794c))

## 1.0.0-beta.1

### Major Changes

- feat: lightbox beta release ([5ecde20](https://github.com/rilrom/payload-bites/commit/5ecde20))
