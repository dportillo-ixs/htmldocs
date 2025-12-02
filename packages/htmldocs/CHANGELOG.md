# htmldocs

## 0.4.1

### Patch Changes

- 6636a6b: Fix starter template to use workspace protocol and proper version transformation

  The `init` command now correctly transforms `workspace:*` dependencies to proper semver ranges (e.g., `^0.4.1`) when users run `pnpx htmldocs-v2@latest init`. This fixes the issue where users would get hardcoded versions that don't exist on npm.

  **Changes:**

  - Template dependencies now use `workspace:*` instead of hardcoded versions
  - init.ts properly converts `workspace:*` to `^VERSION` during project initialization
  - Regenerated pnpm-lock.yaml to match package.json

## 0.4.0

### Minor Changes

- e044272: Renamed packages from @htmldocs/_ scope to htmldocs-v2-_ prefix for independent npm publishing

  All internal packages have been renamed to use the `htmldocs-v2-` prefix without a scope:

  - `@htmldocs/render` → `htmldocs-v2-render`
  - `@htmldocs/react` → `htmldocs-v2-react`
  - Main package name remains `htmldocs-v2`

  This change allows the packages to be published to npm independently without conflicts with the existing @htmldocs scope owned by another maintainer.

### Patch Changes

- Updated dependencies [e044272]
  - htmldocs-v2-render@0.4.0

## 0.3.0

### Minor Changes

- fd38cab: Primera publicación de htmldocs-v2. Cambio de nombre de htmldocs a htmldocs-v2 para publicar una nueva versión del paquete con mejoras y correcciones.

  Paquetes incluidos:

  - htmldocs-v2: Paquete principal con CLI
  - @htmldocs/render: Paquete de renderizado de documentos
  - @htmldocs/react: Componentes de React para htmldocs

### Patch Changes

- Updated dependencies [fd38cab]
  - @htmldocs/render@0.3.0

## 0.2.30

### Patch Changes

- c6753c4: Update cli auth
  - @htmldocs/render@0.2.30

## 0.2.29

### Patch Changes

- ddd6fbc: Add more metadata
  - @htmldocs/render@0.2.29

## 0.2.28

### Patch Changes

- abdcd3a: add npm keywords
  - @htmldocs/render@0.2.28

## 0.2.27

### Patch Changes

- d232426: update README
  - @htmldocs/render@0.2.27

## 0.2.26

### Patch Changes

- 2fc14f7: fix build
  - @htmldocs/render@0.2.26

## 0.2.25

### Patch Changes

- c737b5f: add new version popup
  - @htmldocs/render@0.2.25

## 0.2.24

### Patch Changes

- 9e2b062: hot reload context vars
  - @htmldocs/render@0.2.24

## 0.2.23

### Patch Changes

- 7043ac8: add zoom controls
- Updated dependencies [7043ac8]
  - @htmldocs/render@0.2.23

## 0.2.22

### Patch Changes

- 7a5492d: fix dependent hot reloading
  - @htmldocs/render@0.2.22

## 0.2.21

### Patch Changes

- b0c33de: expand hot refresh to cwd
  - @htmldocs/render@0.2.21

## 0.2.20

### Patch Changes

- d5f8135: add loader
- Updated dependencies [91e3544]
  - @htmldocs/render@0.2.20

## 0.2.19

### Patch Changes

- fa33e6f: Add CTA
  - @htmldocs/render@0.2.19

## 0.2.18

### Patch Changes

- 60f8e6b: improve logging, dev experience
- Updated dependencies [60f8e6b]
  - @htmldocs/render@0.2.18

## 0.2.17

### Patch Changes

- 191eb52: restore packages
- Updated dependencies [191eb52]
  - @htmldocs/render@0.2.17

## 0.2.16

### Patch Changes

- 8787d4b: add .npmignore
- Updated dependencies [8787d4b]
  - @htmldocs/render@0.2.16

## 0.2.15

### Patch Changes

- 23ac0f9: reduce bundle size
  - @htmldocs/render@0.2.15

## 0.2.14

### Patch Changes

- a6c234f: update api url
  - @htmldocs/render@0.2.14

## 0.2.13

### Patch Changes

- accc5e7: changeset add changelogs
  - @htmldocs/render@0.2.13
