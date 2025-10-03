import { mount } from '@vue/test-utils'
import HomePage from '@/views/LoginPage.vue'
import { describe, expect, test } from 'vitest'

describe('LoginPage.vue', () => {
  test('renders home vue', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.text()).toMatch('Ready to create an app?')
  })
})
