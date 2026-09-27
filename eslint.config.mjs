// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { tooling: true, stylistic: true },
  dirs: { src: ['./playground', './playground/app', './test/fixtures/custom-error', './test/fixtures/custom-error/app'] },
})
