## 📌 Description
<!-- Provide a brief explanation of the changes introduced in this PR. -->

## 🔗 Related Issue
<!-- Link to the issue being fixed or addressed (e.g. Fixes #123, Closes #456) -->
Fixes #

## 🏷️ Type of Change
<!-- Please check the options that apply using [x] -->
- [ ] 🐛 `fix`: Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ `feat`: New feature (non-breaking change which adds functionality)
- [ ] 🎛️ `audio-dsp`: Audio engine, Web Audio API, or DSP algorithm update
- [ ] 💄 `style`: UI/UX styling, Vuetify components, or visual design polish
- [ ] ♻️ `refactor`: Code refactoring without changing functionality
- [ ] ⚡ `perf`: Performance or memory optimization
- [ ] 📝 `docs`: Documentation updates or translation improvements
- [ ] 🔧 `chore` / `build` / `ci`: Tooling, dependencies, or pipeline updates

## 🧪 Verification & Testing
<!-- Describe the steps you took to verify your changes. -->
- [ ] **Unit / Manual Testing**: Tested locally with `npm run dev` (frontend & backend).
- [ ] **Audio / DSP Check** *(if applicable)*:
  - Verified no audio clipping, buffer underrun, or glitching.
  - Tested pitch shifting / speed tempo scaling / LUFS normalization.
- [ ] **UI / Vuetify Guidelines**:
  - Adheres to Vuetify-First principles (no ad-hoc HTML buttons/inputs).
  - Uses standard reusable audio components (`BoxPlayer`, `GlassTooltip`).
- [ ] **Cross-Browser Verification**: Tested on Chrome / Firefox / Safari.

## 📸 Screenshots / Demos (if applicable)
<!-- Add screenshots or screen recordings showcasing the visual or audio changes. -->

## 📋 Checklist
- [ ] My code adheres to the project's coding style guidelines.
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat: ...`, `fix: ...`).
- [ ] I have performed a self-review of my own code.
- [ ] No hardcoded secrets, tokens, or environment-specific credentials are included.
