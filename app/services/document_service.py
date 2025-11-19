"""Service for loading and processing PDF documents."""

import re

import pypdf
from llama_index.core.schema import Document
from openai import OpenAI


class DocumentService:
    """
    Service to load and process PDF documents into structured Document objects.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path

    @staticmethod
    def _add_spaces_to_text(text: str) -> str:
        """Clean up text spacing and formatting (basic regex-based cleanup)."""
        # Add spaces between lowercase and uppercase letters (for camelCase)
        text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)

        # Add spaces after punctuation if missing
        text = re.sub(r"([.,;:!?])([A-Za-z])", r"\1 \2", text)

        # Add spaces between letters and digits
        text = re.sub(r"([a-zA-Z])(\d)", r"\1 \2", text)
        text = re.sub(r"(\d)([A-Za-z])", r"\1 \2", text)

        # Clean up multiple spaces and normalize whitespace
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    @staticmethod
    def _improve_text_with_llm(text: str, api_key: str | None = None) -> str:
        """
        Use LLM to improve text quality by fixing spacing and OCR errors.

        Args:
            text: Raw extracted text
            api_key: OpenAI API key (optional, uses env var if not provided)

        Returns:
            Improved text with proper spacing and corrections
        """
        if not text or len(text.strip()) < 10:
            return text

        try:
            # Initialize OpenAI client
            client = OpenAI(api_key=api_key) if api_key else OpenAI()

            # Call OpenAI API to fix text
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a text correction assistant for legal documents. "
                            "Fix spacing issues and OCR errors in the provided text while "
                            "preserving the exact meaning and all legal terminology. "
                            "Only fix spacing, punctuation, and obvious errors. "
                            "Do not rephrase, summarize, or change any legal terms. "
                            "Return ONLY the corrected text without any explanations or additions."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Fix spacing and formatting issues in this text:\n\n{text}",
                    },
                ],
                temperature=0.1,  # Low temperature for consistency
                max_tokens=1000,  # Adjust based on expected text length
            )

            improved_text = response.choices[0].message.content.strip()

            # Validate the response is not empty
            if improved_text and len(improved_text) > 0:
                return improved_text
            else:
                # Fallback to original if LLM returns empty
                return text

        except Exception as e:
            # If LLM call fails, log error and return original text
            print(f"Warning: LLM text improvement failed: {str(e)}")
            print(f"Falling back to original text for: {text[:50]}...")
            return text

    def _extract_section_titles(self, full_text: str) -> dict[str, str]:
        """Extract section titles by matching pattern '{num}. {Title}{num}.1.'"""
        section_titles = {}

        for i in range(1, 50):
            # More flexible pattern to handle extra whitespace from layout extraction
            pattern = rf"{i}\.\s+([A-Z][a-z]+)\s*{i}\.1\."
            match = re.search(pattern, full_text)
            if match:
                section_titles[str(i)] = match.group(1)

        return section_titles

    def create_documents(self) -> list[Document]:
        """Parse PDF into Document objects with metadata for each law section."""
        with open(self.file_path, "rb") as pdf_file:
            reader = pypdf.PdfReader(pdf_file)
            full_text = "".join(
                page.extract_text(extraction_mode="layout") for page in reader.pages
            )

        full_text = re.sub(r"^.*?(?=1\.\s+)", "", full_text, flags=re.DOTALL)
        full_text = re.sub(r"Citations:.*$", "", full_text, flags=re.DOTALL)

        section_titles = self._extract_section_titles(full_text)
        pattern = r"(\d+\.\d+(?:\.\d+)*)\.\s+"
        parts = re.split(pattern, full_text)

        documents = []
        for i in range(1, len(parts) - 1, 2):
            section_num = parts[i]
            text = parts[i + 1].strip()
            # Remove trailing section headers (e.g., "2. Religion" at the end)
            text = re.sub(r"\d+\.\s+[A-Z][a-z]+\s*$", "", text).strip()

            # Basic cleanup with regex
            text = self._add_spaces_to_text(text)

            # Improve text quality using LLM
            text = self._improve_text_with_llm(text)

            if not text:
                continue

            main_section_num = section_num.split(".")[0]
            section_title = section_titles.get(
                main_section_num, f"Section {main_section_num}"
            )

            documents.append(
                Document(
                    metadata={
                        "Section": f"{section_title} {section_num}",
                        "MainSection": section_title,
                        "SubsectionNumber": section_num,
                    },
                    text=text,
                )
            )

        return documents
