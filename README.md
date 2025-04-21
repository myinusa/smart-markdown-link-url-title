# Smart Markdown Link URL Detection

This VS Code extension provides functionality for detecting URLs in markdown documents. It helps you identify URLs at the cursor position or within selected text.

## Features

- Detect URLs at the cursor position
- Detect URLs in selected text
- Validate URLs for correctness
- Handle edge cases like URLs in code blocks

## Commands

This extension contributes the following commands:

- `Markdown: Detect URL at Cursor` - Detects and displays the URL at the current cursor position
- `Markdown: Detect URLs in Selection` - Detects and displays all URLs in the current text selection

## URL Detection

The extension uses a robust regex pattern to detect URLs in markdown documents:

```typescript
/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
```

This pattern matches:
- URLs with http or https protocols
- Optional www subdomain
- Domain names with at least one dot
- Optional paths, query parameters, and fragments

## Edge Cases Handled

- URLs in code blocks (both fenced and inline)
- Malformed URLs
- URLs with special characters
- URLs with query parameters and fragments

## Requirements

No special requirements or dependencies.

## Extension Settings

This extension does not contribute any settings yet.

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release with URL detection functionality.

---

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Run tests
npm run test
```

**Enjoy!**
