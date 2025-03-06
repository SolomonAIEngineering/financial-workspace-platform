import { describe, expect, it } from 'vitest'

import { fail } from 'node:assert'
import { validation } from './index'
import { z } from 'zod'

describe('validation schemas', () => {
  describe('identifier', () => {
    it('should accept valid identifiers', () => {
      const validIdentifiers = [
        'abc',
        'test-123',
        'my_identifier',
        'some.identifier',
        'complex:identifier-123',
        'a'.repeat(256),
        'ALL_CAPS_VALID',
        'mixed.Case-123',
        'min3',
        '123numeric',
        'dots.are.valid',
        'multiple-hyphens-ok',
        'under_scores_fine',
        'colons:allowed:here',
      ]

      for (const id of validIdentifiers) {
        expect(() => validation.identifier.parse(id)).not.toThrow()
      }
    })

    it('should reject invalid identifiers', () => {
      const invalidIdentifiers = [
        'ab', // too short
        'invalid@character', // invalid character
        'spaces not allowed',
        'special#chars',
        'a'.repeat(257), // too long
        '', // empty string
        ' ', // just space
        'tab\there',
        'newline\nhere',
        '💩', // emoji
        'slash/notallowed',
        'back\\slash',
        '*asterisk',
        '(parentheses)',
        '$dollar',
      ]

      for (const id of invalidIdentifiers) {
        expect(() => validation.identifier.parse(id)).toThrow()
      }
    })

    it('should return the same value when valid', () => {
      const id = 'valid-identifier-123'
      expect(validation.identifier.parse(id)).toBe(id)
    })

    describe('edge cases', () => {
      it('should handle boundary length cases', () => {
        // Exactly minimum length
        expect(() => validation.identifier.parse('abc')).not.toThrow()
        // Exactly maximum length
        expect(() => validation.identifier.parse('a'.repeat(256))).not.toThrow()
        // One character less than minimum
        expect(() => validation.identifier.parse('ab')).toThrow()
        // One character more than maximum
        expect(() => validation.identifier.parse('a'.repeat(257))).toThrow()
      })

      it('should handle various combinations of allowed characters', () => {
        const validCombinations = [
          'a-b_c.d:e',
          `${'a'.repeat(3)}-${'b'.repeat(250)}`,
          '123-456_789',
          'a:b:c:d:e:f',
          'a.b.c.d.e.f',
          'a_b_c_d_e_f',
          'a-b-c-d-e-f',
        ]

        for (const combo of validCombinations) {
          expect(() => validation.identifier.parse(combo)).not.toThrow()
        }
      })

      it('should reject null and undefined', () => {
        expect(() => validation.identifier.parse(null)).toThrow()
        expect(() => validation.identifier.parse(undefined)).toThrow()
      })

      it('should reject non-string types', () => {
        const invalidTypes = [
          123,
          true,
          {},
          [],
          new Date(),
          Symbol('test'),
          () => { },
        ]

        for (const invalid of invalidTypes) {
          expect(() => validation.identifier.parse(invalid)).toThrow()
        }
      })
    })
  })

  describe('name', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Project Name 123',
        'Valid Name!@#$%^&*()',
        'a'.repeat(256),
        '   Spaces at start and end   ',
        'Special chars: !@#$%^&*()',
        'Emojis 👍 are fine',
        'Multi\nline\ntext',
        'Tabs\tand\tspaces',
        'Chinese 中文',
        'Русский text',
        '123456789',
        'Mixed Case TeXt',
      ]

      for (const n of validNames) {
        expect(() => validation.name.parse(n)).not.toThrow()
      }
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        'ab', // too short
        'a'.repeat(257), // too long
        '', // empty string
        '  ', // just spaces
        '\n', // just newline
        '\t', // just tab
      ]

      for (const n of invalidNames) {
        expect(() => validation.name.parse(n)).toThrow()
      }
    })

    it('should preserve original string when valid', () => {
      const name = '  Spaces  Preserved  '
      expect(validation.name.parse(name)).toBe(name)
    })

    describe('edge cases', () => {
      it('should handle various whitespace combinations', () => {
        const whitespaceTests = [
          `${' '.repeat(3)}valid${' '.repeat(3)}`,
          `${'\t'.repeat(3)}valid${'\t'.repeat(3)}`,
          `${'\n'.repeat(3)}valid${'\n'.repeat(3)}`,
          'multiple    spaces    between    words',
          'mixed\tspaces\nand\ttabs',
          'unicode\u2003spaces\u2003here', // em space
          'zero\u200Bwidth\u200Bspaces', // zero-width space
        ]

        for (const test of whitespaceTests) {
          expect(() => validation.name.parse(test)).not.toThrow()
        }
      })

      it('should handle various unicode characters', () => {
        const unicodeTests = [
          '한글 테스트', // Korean
          'עִבְרִית', // Hebrew
          'العربية', // Arabic
          '日本語テスト', // Japanese
          'Ελληνικά', // Greek
          '🎉 Party 🎊 Time', // Emojis
          '∑∏∪∩≤≥≠√', // Mathematical symbols
          '©®™℠', // Special symbols
        ]

        for (const test of unicodeTests) {
          expect(() => validation.name.parse(test)).not.toThrow()
        }
      })

      it('should handle mixed content', () => {
        const mixedTests = [
          'HTML-like <tags> content',
          'URL: https://example.com',
          'Email: test@example.com',
          'Phone: +1-234-567-8900',
          'Math: 1 + 1 = 2',
          'Code: console.error("test")',
          'SQL: SELECT * FROM table',
          'Path: C:\\Windows\\System32',
        ]

        for (const test of mixedTests) {
          expect(() => validation.name.parse(test)).not.toThrow()
        }
      })
    })
  })

  describe('description', () => {
    it('should accept valid descriptions', () => {
      const validDescriptions = [
        'A simple description',
        'Description with numbers 123',
        'Special chars !@#$%^&*()',
        'a'.repeat(256),
        'Multi\nline\ndescription',
        'Tabs\tand\tspaces',
        'URLs https://example.com',
        'Email test@example.com',
        'Emojis 🎉 included',
        'Technical <code>examples</code>',
        'Lists:\n- Item 1\n- Item 2',
        'Mixed     spacing',
        '   Leading and trailing spaces   ',
      ]

      for (const desc of validDescriptions) {
        expect(() => validation.description.parse(desc)).not.toThrow()
      }
    })

    it('should reject invalid descriptions', () => {
      const invalidDescriptions = [
        'ab', // too short
        'a'.repeat(257), // too long
        '', // empty string
        '  ', // just spaces
        '\n', // just newline
        '\t', // just tab
      ]

      for (const desc of invalidDescriptions) {
        expect(() => validation.description.parse(desc)).toThrow()
      }
    })

    it('should preserve formatting when valid', () => {
      const desc = '  Formatted\n  Description\n  With Spaces  '
      expect(validation.description.parse(desc)).toBe(desc)
    })

    describe('edge cases', () => {
      it('should handle markdown-like content', () => {
        const markdownTests = [
          '# Heading',
          '* Bullet point',
          '1. Numbered list',
          '> Blockquote',
          '`code`',
          '**bold** and *italic*',
          '[link](https://example.com)',
          '| table | header |',
        ]

        for (const test of markdownTests) {
          expect(() => validation.description.parse(test)).not.toThrow()
        }
      })

      it('should handle code-like content', () => {
        const codeTests = [
          'function test() { return true; }',
          'SELECT * FROM table WHERE id = 1',
          '<div class="test">HTML</div>',
          'const x = { key: "value" };',
          'npm install package-name',
          'git commit -m "message"',
          'docker run -p 8080:80 image',
        ]

        for (const test of codeTests) {
          expect(() => validation.description.parse(test)).not.toThrow()
        }
      })
    })
  })

  describe('solomonAiId', () => {
    it('should accept valid Solomon AI IDs', () => {
      const validIds = [
        'key_12345678',
        'usr_abcdefghijklm',
        'api_123456789abc',
        'keyy_12345678',
        'bot_123456789',
        'api_abcdefghijklmnop',
        'key_1234567890123',
        'usr_abcdef12345678',
      ]

      for (const id of validIds) {
        expect(() => validation.solomonAiId.parse(id)).not.toThrow()
      }
    })

    it('should reject invalid Solomon AI IDs', () => {
      const testCases = [
        { id: 'ke_12345678', reason: 'prefix too short' },
        { id: 'keyys_12345678', reason: 'prefix too long' },
        { id: 'key12345678', reason: 'missing underscore' },
        { id: 'key_123', reason: 'id part too short' },
        { id: 'key_', reason: 'missing id part' },
        { id: 'KEY_12345678', reason: 'uppercase prefix' },
        { id: 'key_123456!8', reason: 'special characters in id' },
        { id: '_key12345678', reason: 'underscore at start' },
        { id: 'key_12345678_', reason: 'underscore at end' },
        { id: '123_12345678', reason: 'numeric prefix' },
        { id: 'key_', reason: 'missing id part' },
        { id: '_12345678', reason: 'missing prefix' },
        { id: 'key__12345678', reason: 'double underscore' },
        { id: ' key_12345678', reason: 'leading space' },
        { id: 'key_12345678 ', reason: 'trailing space' },
      ]

      for (const { id, reason } of testCases) {
        expect(
          () => validation.solomonAiId.parse(id),
          `Should reject "${id}" (${reason})`,
        ).toThrow()
      }
    })

    it('should specifically reject uppercase prefixes', () => {
      const uppercaseCases = [
        'KEY_12345678',
        'Api_12345678',
        'USR_12345678',
        'Key_12345678',
      ]

      for (const id of uppercaseCases) {
        const result = validation.solomonAiId.safeParse(id)
        expect(result.success).toBe(false)
      }
    })

    it('should preserve valid IDs exactly as input', () => {
      const id = 'key_12345678'
      expect(validation.solomonAiId.parse(id)).toBe(id)
    })

    describe('edge cases', () => {
      it('should handle various valid prefix-id combinations', () => {
        const validCombinations = [
          { prefix: 'key', id: '12345678' }, // minimum length id
          { prefix: 'api', id: 'a'.repeat(50) }, // long id
          { prefix: 'usr', id: '123abc456def' }, // mixed alphanumeric
          { prefix: 'bot', id: '0123456789' }, // all numbers
          { prefix: 'app', id: 'abcdefghij' }, // all letters
        ]

        for (const { prefix, id } of validCombinations) {
          const testId = `${prefix}_${id}`
          expect(() => validation.solomonAiId.parse(testId)).not.toThrow()
        }
      })

      it('should reject malformed combinations', () => {
        const invalidCombinations = [
          { value: 'key_123_456', reason: 'multiple underscores' },
          { value: 'key_123 456', reason: 'space in id' },
          { value: 'key_123-456', reason: 'hyphen in id' },
          { value: 'key_123.456', reason: 'dot in id' },
          { value: 'key_123+456', reason: 'plus in id' },
          { value: 'key_123/456', reason: 'slash in id' },
          { value: 'key_123\\456', reason: 'backslash in id' },
          { value: 'key_123#456', reason: 'hash in id' },
          { value: 'key_123$456', reason: 'dollar in id' },
        ]

        for (const { value, reason } of invalidCombinations) {
          expect(
            () => validation.solomonAiId.parse(value),
            `Should reject "${value}" (${reason})`,
          ).toThrow()
        }
      })

      it('should handle type coercion attempts', () => {
        type CoercionAttempt = {
          value: unknown;
          expectedToThrow: boolean;
        }

        const coercionAttempts: CoercionAttempt[] = [
          { value: new String('key_12345678'), expectedToThrow: true },
          { value: { toString: () => 'key_12345678' }, expectedToThrow: true },
          { value: ['key_12345678'], expectedToThrow: true },
          { value: { key: '12345678' }, expectedToThrow: true },
        ]

        for (const { value, expectedToThrow } of coercionAttempts) {
          if (expectedToThrow) {
            expect(() => validation.solomonAiId.parse(value)).toThrow()
          } else {
            expect(() => validation.solomonAiId.parse(value)).not.toThrow()
          }
        }
      })
    })
  })

  describe('validation error messages', () => {
    it('should provide helpful error messages', () => {
      const testCases = [
        {
          schema: 'identifier',
          value: 'a',
          expectedError: /must contain at least 3 character/i,
        },
        {
          schema: 'name',
          value: 'a'.repeat(257),
          expectedError: /must contain at most 256 character/i,
        },
        {
          schema: 'description',
          value: '',
          expectedError: /must contain at least 3 character/i,
        },
        {
          schema: 'solomonAiId',
          value: 'invalid',
          expectedError: /between 3 and 4 characters/i,
        },
      ]

      for (const { schema, value, expectedError } of testCases) {
        try {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          ; (validation as any)[schema].parse(value)
          fail('Should have thrown an error')
        } catch (error) {
          if (error instanceof z.ZodError) {
            expect(error.errors[0].message).toMatch(expectedError)
          }
        }
      }
    })
  })
})
