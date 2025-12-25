import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Iconify } from '../iconify';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter description...',
  error = false,
  helperText,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'min-height: 120px; padding: 12px; outline: none;',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const MenuButton = ({
    onClick,
    isActive = false,
    icon,
    tooltip,
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: any;
    tooltip: string;
  }) => (
    <Button
      size="small"
      variant={isActive ? 'contained' : 'text'}
      onClick={onClick}
      sx={{
        minWidth: 32,
        height: 32,
        color: isActive ? 'primary.contrastText' : 'text.secondary',
        bgcolor: isActive ? 'primary.main' : 'transparent',
        '&:hover': {
          bgcolor: isActive ? 'primary.dark' : 'action.hover',
        },
      }}
      title={tooltip}
    >
      <Iconify icon={icon as any} width={16} />
    </Button>
  );

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          borderColor: error ? 'error.main' : 'divider',
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            borderWidth: 2,
          },
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            gap: 1,
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: '48px !important',
            bgcolor: 'grey.50',
          }}
        >
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon="solar:pen-bold"
            tooltip="Bold"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon="solar:pen-bold"
            tooltip="Italic"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon="solar:pen-bold"
            tooltip="Strikethrough"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon="solar:pen-bold"
            tooltip="Heading 2"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon="solar:pen-bold"
            tooltip="Heading 3"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon="solar:pen-bold"
            tooltip="Bullet List"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon="solar:check-circle-bold"
            tooltip="Ordered List"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon="solar:pen-bold"
            tooltip="Quote"
          />
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            isActive={false}
            icon="solar:pen-bold"
            tooltip="Horizontal Rule"
          />
        </Toolbar>

        <Box
          sx={{
            '& .ProseMirror': {
              minHeight: 120,
              padding: 1.5,
              outline: 'none',
              '& p': { margin: 0, marginBottom: 1 },
              '& h2, & h3': { margin: 0, marginBottom: 0.5, marginTop: 1 },
              '& ul, & ol': { paddingLeft: 2, margin: 0 },
              '& li': { marginBottom: 0.25 },
              '& blockquote': {
                borderLeft: 4,
                borderColor: 'grey.300',
                paddingLeft: 2,
                margin: 0,
                marginBottom: 1,
                fontStyle: 'italic',
                color: 'text.secondary',
              },
              '& hr': {
                border: 'none',
                borderTop: 1,
                borderColor: 'divider',
                margin: '16px 0',
              },
            },
            '& .ProseMirror p.is-editor-empty:first-of-type::before': {
              content: `"${placeholder}"`,
              float: 'left',
              color: 'text.disabled',
              pointerEvents: 'none',
              height: 0,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>

      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, ml: 1.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
