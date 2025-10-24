# Technical Documentation: PDF Processing and State Management

The PDF management system utilizes IndexedDB for storage and state management. Key features include:

- PDF files (uploaded or merged) are stored in IndexedDB
- Reactive state management through IndexedDB integration
- Entity data used to instantiate `LivePDF` classes via `PDFService`
- `PDFService` handles PDF merging operations
- `LivePDF` manages page rendering and PDF-related tasks

# Known issues and limitations

In the `PDFService`, memoized functions cache LivePDF instances, which is beneficial but poses challenges for cache invalidation and disposal of LivePDF instances. Manual removal from the cache is required, as there is no built-in garbage collection. When a LivePDF is invalidated, its contents must be disposed of using the dispose function, which revokes the object URL created from the image file objects. This design is not optimal, and for more complex scenarios, a dedicated cache that allows for easier and automatic disposal may be necessary.

Additionally, LivePDF itself contains memoized elements, which is also suboptimal. As noted in the root README, we should avoid non-reactive objects and instead expose reactive primitives or observable objects. Overall, while caching within LivePDF is not strictly necessary, external management would simplify implementation and improve the system's efficiency.

# Errors

Currently, error handling is minimal and doesn't provide detailed error differentiation. The application shows generic error messages (like "Unknown error") in toasts.

Potential improvements:
- Implement structured error handling using [neverthrow](https://github.com/supermacro/neverthrow)
- Define specific error types for different failure scenarios
- Enable contextual error messages in the UI based on error types

These enhancements would improve error reporting and user experience.