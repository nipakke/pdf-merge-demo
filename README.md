# 📄 PDF Merger (Client-Side)

A straightforward, fast, and **entirely client-side** web application built to merge two PDF files directly in your browser.

---

## 🚨 **CRITICAL WARNING: LEARNING PROJECT ONLY!** 🚨

**This application is a personal project, not a production tool. Please DO NOT use it for sensitive or critical documents.**

I created this solely to:
* Practice **client-side PDF processing** (e.g., using libraries like `pdf-lib`).
* Learn and implement the browser's **IndexedDB API** for local file handling.
* Deepen my knowledge of client-side web architecture.

While functional, it may lack extensive error handling and is not guaranteed for reliability. **Use at your own risk for non-critical merges.**

---

## 🚀 Key Features

* **100% Client-Side:** All merging operations are executed locally within your browser using **JavaScript**. **Files are never uploaded** to a server.
* **Privacy-First:** Your documents remain on your machine from start to finish.
* **Local Storage:** PDFs are temporarily stored in the browser's **IndexedDB** for quick, session-based merging.

---

## 🛠️ Tech stack

* [Nuxt](https://nuxt.com)
* [Nuxt/UI](https://ui.nuxt.com)
* [Dexie](https://dexie.org)
* [pdf-lib](https://pdf-lib.js.org)
* [pdf.js](https://mozilla.github.io/pdf.js)


# Known issues and limitations

Password protected PDFs are not supported.

The PDF objects in `lib/pdf/pdf` are plain objects derived from values returned by Dexie and are not reactive by design. This means that while some parts of the UI (like the library page and other PDF view components) can be reactive through component-level live queries against Dexie, the merge result PDF is not reactive. Changes such as renaming the merged output are not automatically reflected in the UI.

This limitation stems from the PDF module being framework-agnostic and not relying on Vue reactivity. Making the PDF layer fully reactive would require a new implementation that exposes reactive primitives or observable objects.

This constraint was discovered recently in the current design. For now, use component-level live queries or explicit refresh logic as a workaround. A long-term solution will require reworking the PDF layer to emit or expose reactive/observable state.
