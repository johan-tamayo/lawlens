import os
import re
from dataclasses import dataclass

import pypdf
import qdrant_client
from dotenv import load_dotenv
from llama_index.core import ServiceContext, VectorStoreIndex
from llama_index.core.schema import Document
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.qdrant import QdrantVectorStore
from pydantic import BaseModel

load_dotenv()
key = os.getenv("OPENAI_API_KEY")


@dataclass
class Input:
    query: str
    file_path: str


@dataclass
class Citation:
    source: str
    text: str


class Output(BaseModel):
    query: str
    response: str
    citations: list[Citation]


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


class QdrantService:
    def __init__(self, k: int = 2):
        self.index = None
        self.k = k

    def connect(self) -> None:
        client = qdrant_client.QdrantClient(location=":memory:")

        vstore = QdrantVectorStore(client=client, collection_name="temp")

        service_context = ServiceContext.from_defaults(
            embed_model=OpenAIEmbedding(), llm=OpenAI(api_key=key, model="gpt-4")
        )

        self.index = VectorStoreIndex.from_vector_store(
            vector_store=vstore, service_context=service_context
        )

    def load(self, docs=list[Document]):
        self.index.insert_nodes(docs)

    def query(self, query_str: str) -> Output:
        """
        This method needs to initialize the query engine, run the query, and return
        the result as a pydantic Output class. This is what will be returned as
        JSON via the FastAPI endpount. Fee free to do this however you'd like, but
        a its worth noting that the llama-index package has a CitationQueryEngine...

        Also, be sure to make use of self.k (the number of vectors to return based
        on semantic similarity).

        # Example output object
        citations = [
            Citation(source="Law 1", text="Theft is punishable by hanging"),
            Citation(source="Law 2", text="Tax evasion is punishable by banishment."),
        ]

        output = Output(
            query=query_str,
            response=response_text,
            citations=citations
            )

        return output

        """


if __name__ == "__main__":
    doc_service = DocumentService("docs/laws.pdf")
    docs = doc_service.create_documents()

    qdrant = QdrantService()
    qdrant.connect()
    qdrant.load(docs)

    result = qdrant.query("what happens if I steal?")
    print(result)
