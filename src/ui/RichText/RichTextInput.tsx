'use client'

import { Box, HStack } from '@chakra-ui/react'
import { type Ref, useEffect, useRef } from 'react'
import { LuBold, LuItalic, LuList } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'

import { IconButton } from '../IconButton'
import bag from './i11n.json'
import { sanitizeRichText } from './richText'

export type RichTextInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  disabled?: boolean
  /** The form field's described-by id, when it has an error. */
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  inputRef?: Ref<HTMLDivElement>
}

const buttonProps = {
  type: 'button' as const,
  variant: 'ghost' as const,
  size: 'sm' as const,
}

/**
 * A description with bold, italic and a list. The value is HTML limited to
 * those tags. An empty field stays empty rather than storing a blank paragraph.
 */
export function RichTextInput({
  value,
  onChange,
  placeholder,
  id,
  disabled = false,
  inputRef,
  ...aria
}: RichTextInputProps) {
  const t = useI11n(bag)
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || document.activeElement === editor) return
    const next = sanitizeRichText(value)
    if (editor.innerHTML !== next) editor.innerHTML = next
  }, [value])

  const publish = () => {
    const html = sanitizeRichText(editorRef.current?.innerHTML ?? '')
    onChange(html)
  }

  const format = (command: 'bold' | 'italic' | 'insertUnorderedList') => {
    editorRef.current?.focus()
    document.execCommand(command)
    publish()
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={aria['aria-invalid'] ? 'status.danger.fg' : 'border.default'}
      borderRadius="lg"
      bg="bg.surface"
      overflow="hidden"
      _focusWithin={sdlFocusRing}
    >
      <HStack
        gap={0.5}
        px={1.5}
        py={1}
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <IconButton
          {...buttonProps}
          aria-label={t.bold}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format('bold')}
        >
          <LuBold aria-hidden />
        </IconButton>
        <IconButton
          {...buttonProps}
          aria-label={t.italic}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format('italic')}
        >
          <LuItalic aria-hidden />
        </IconButton>
        <IconButton
          {...buttonProps}
          aria-label={t.list}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format('insertUnorderedList')}
        >
          <LuList aria-hidden />
        </IconButton>
      </HStack>
      <Box
        ref={(node: HTMLDivElement | null) => {
          editorRef.current = node
          if (typeof inputRef === 'function') inputRef(node)
          else if (inputRef) inputRef.current = node
        }}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        contentEditable={!disabled}
        suppressContentEditableWarning
        minH="7.5rem"
        px={3}
        py={2}
        fontSize="md"
        lineHeight="tall"
        color="text.default"
        outline="none"
        css={{
          '&:empty:before': {
            content: 'attr(data-placeholder)',
            color: 'var(--chakra-colors-text-subtle)',
          },
          '& p': { margin: 0 },
          '& ul, & ol': { margin: 0, paddingInlineStart: '1.25rem' },
        }}
        data-placeholder={placeholder}
        onInput={publish}
        onBlur={publish}
        {...aria}
      />
    </Box>
  )
}
