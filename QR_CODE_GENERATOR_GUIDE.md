# 📊 Google Sheets QR Code Generator Guide

This guide provides a copy-pasteable spreadsheet structure and a powerful formula to generate **40 unique QR Codes** in Google Sheets instantly.

---

## ⚡ The Magical Google Sheets QR Code Formula
Google Sheets has a built-in ability to draw images from web APIs. You can generate a QR Code instantly for any URL in cell `C2` by pasting this formula in cell `D2`:

```excel
=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C2))
```

This formula uses Google's secure Charts API to compile the URL into a high-quality, printable QR Code image directly inside the spreadsheet cell!

---

## 📋 Google Sheets Template (S.T.D. Dental Lab Catalog)
Copy this structure into a new Google Sheet to generate your catalog codes. 

> [!TIP]
> **Domain Configuration:**
> Replace `https://your-domain.com` in Column C with your actual website domain (e.g., `https://std-catalog.com` once deployed).

### Spreadsheet Columns and Formula Setup:

| Column A (Product ID) | Column B (Product Name) | Column C (Target URL) | Column D (Automatic QR Code Generator) |
| :--- | :--- | :--- | :--- |
| **STDR01** | รีเทนเนอร์พรีเมียม STDR01 | `https://your-domain.com?v=stdr01` | `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C2))` |
| **STDR02** | รีเทนเนอร์พรีเมียม STDR02 | `https://your-domain.com?v=stdr02` | `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C3))` |
| **STDR03** | รีเทนเนอร์พรีเมียม STDR03 | `https://your-domain.com?v=stdr03` | `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C4))` |
| **...** | ... | ... | ... |
| **STDR18** | รีเทนเนอร์พรีเมียม STDR18 | `https://your-domain.com?v=stdr18` | `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C19))` |
| **STDR31** | รีเทนเนอร์พรีเมียม STDR31 | `https://your-domain.com?v=stdr31` | `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C32))` |
| **STDR40** | รีเทนเนอร์พรีเมียม STDR40 | `https://your-domain.com?v=stdr40` | `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(C41))` |

---

## 🖨️ How to Print the QR Codes
1. Set up the columns in Google Sheets as shown above.
2. Drag the formula in **Column D** down to row 41. The QR Codes will render in the cells instantly!
3. To print them nicely, simply adjust the **Row Height** (e.g., make it larger like 100px or 150px) so the QR Codes are large and crisp.
4. Go to **File -> Print** or download as a PDF, and you can cut and paste the generated QR Codes onto your physical catalog sheet design!
