// This file will be used to set up the Jest environment for all tests
import { vi, expect } from 'vitest'

// Set up globals to make tests work with ESM
global.jest = vi
global.expect = expect
