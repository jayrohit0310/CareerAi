import os

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

try:
    import docx
except ImportError:
    docx = None


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts all text from a given PDF file using PyMuPDF.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")
    
    if fitz is None:
        raise RuntimeError("PyMuPDF (pymupdf) is not installed.")

    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        
    return text.strip()


def extract_text_from_docx(docx_path: str) -> str:
    """
    Extracts all text from a given DOCX file using python-docx.
    """
    if not os.path.exists(docx_path):
        raise FileNotFoundError(f"DOCX file not found at: {docx_path}")

    if docx is None:
        raise RuntimeError("python-docx is not installed.")

    text_parts = []
    try:
        doc = docx.Document(docx_path)
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text.strip())
        
        # Also parse tables if present
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    text_parts.append(" | ".join(row_cells))
    except Exception as e:
        print(f"Error reading DOCX: {e}")

    return "\n".join(text_parts).strip()


def extract_text_from_file(file_path: str) -> str:
    """
    Auto-detects file extension and extracts text from PDF or DOCX.
    """
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    elif ext in [".txt", ".md"]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()
    else:
        raise ValueError(f"Unsupported file format: {ext}. Only PDF and DOCX files are supported.")
