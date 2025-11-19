"""Service for loading and processing PDF documents."""

import re

import pypdf
from llama_index.core.schema import Document


class DocumentService:
    """
    Service to load and process PDF documents into structured Document objects.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path

    @staticmethod
    def _add_spaces_to_text(text: str) -> str:
        """Add spaces between concatenated words for better readability."""
        text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
        text = re.sub(r"([.,;:!?])([A-Za-z])", r"\1 \2", text)
        text = re.sub(r"([a-zA-Z])(\d)", r"\1 \2", text)
        text = re.sub(r"(\d)([A-Za-z])", r"\1 \2", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _extract_section_titles(self, full_text: str) -> dict[str, str]:
        """Extract section titles by matching pattern '{num}. {Title}{num}.1.'"""
        section_titles = {}

        for i in range(1, 50):
            pattern = rf"{i}\.\s+([A-Z][a-z]+){i}\.1\."
            match = re.search(pattern, full_text)
            if match:
                section_titles[str(i)] = match.group(1)

        return section_titles

    def create_documents(self) -> list[Document]:
        """Parse PDF into Document objects with metadata for each law section."""
        with open(self.file_path, "rb") as pdf_file:
            reader = pypdf.PdfReader(pdf_file)
            full_text = "".join(page.extract_text() for page in reader.pages)

        full_text = re.sub(r"^.*?(?=1\.\s+)", "", full_text, flags=re.DOTALL)
        full_text = re.sub(r"Citations:.*$", "", full_text, flags=re.DOTALL)

        section_titles = self._extract_section_titles(full_text)
        pattern = r"(\d+\.\d+(?:\.\d+)*)\.\s+"
        parts = re.split(pattern, full_text)

        documents = []
        for i in range(1, len(parts) - 1, 2):
            section_num = parts[i]
            text = re.sub(r"\d+\.\s+[A-Z][a-z]+$", "", parts[i + 1]).strip()
            text = self._add_spaces_to_text(text)

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
