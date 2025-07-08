import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Doro } from '.'

describe('ui/doro', () => {
    it('works', () => {
        render(<Doro />)

        expect(screen.getByRole('img')).toBeDefined()
    })
})
