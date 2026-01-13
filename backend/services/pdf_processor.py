import os
import PyPDF2
import pdfplumber
from typing import List, Dict
from pathlib import Path

class PDFProcessor:
    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_text_pypdf2(self, file_path: str) -> str:
        """Extract text from PDF using PyPDF2"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text with PyPDF2: {str(e)}")
        return text
    
    def extract_text_pdfplumber(self, file_path: str) -> str:
        """Extract text from PDF using pdfplumber (better for complex layouts)"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text with pdfplumber: {str(e)}")
        return text
    
    def extract_text(self, file_path: str, method: str = "pdfplumber") -> str:
        """Extract text from PDF using specified method"""
        if method == "pdfplumber":
            return self.extract_text_pdfplumber(file_path)
        elif method == "pypdf2":
            return self.extract_text_pypdf2(file_path)
        else:
            # Try pdfplumber first, fallback to PyPDF2
            try:
                return self.extract_text_pdfplumber(file_path)
            except:
                return self.extract_text_pypdf2(file_path)
    
    def get_page_count(self, file_path: str) -> int:
        """Get total number of pages in PDF"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return len(pdf_reader.pages)
        except Exception as e:
            raise Exception(f"Error getting page count: {str(e)}")
    
    def extract_page_range(self, file_path: str, start_page: int, end_page: int) -> str:
        """Extract text from specific page range"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                # Validate page range
                start_page = max(0, start_page)
                end_page = min(total_pages - 1, end_page)
                
                for page_num in range(start_page, end_page + 1):
                    text += pdf_reader.pages[page_num].extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error extracting page range: {str(e)}")
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict[str, any]]:
        """
        Split text into logical chunks with overlap.
        Tries to split at paragraph boundaries when possible.
        """
        chunks = []
        paragraphs = text.split('\n\n')
        
        current_chunk = ""
        chunk_id = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # If adding this paragraph would exceed chunk_size
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append({
                    "id": chunk_id,
                    "text": current_chunk.strip(),
                    "char_count": len(current_chunk)
                })
                chunk_id += 1
                
                # Keep overlap from previous chunk
                words = current_chunk.split()
                overlap_text = " ".join(words[-overlap:]) if len(words) > overlap else current_chunk
                current_chunk = overlap_text + "\n\n" + para
            else:
                current_chunk += "\n\n" + para if current_chunk else para
        
        # Add the last chunk
        if current_chunk:
            chunks.append({
                "id": chunk_id,
                "text": current_chunk.strip(),
                "char_count": len(current_chunk)
            })
        
        return chunks
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file to disk"""
        file_path = self.upload_dir / filename
        with open(file_path, 'wb') as f:
            f.write(file_content)
        return str(file_path)
