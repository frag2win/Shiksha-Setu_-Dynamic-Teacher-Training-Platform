"""
ChromaDB Vector Store for RAG with proper text handling
Compatible with Python 3.13+ and fixes binary/hex output issues
"""

try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError as e:
    chromadb = None
    Settings = None
    CHROMADB_AVAILABLE = False
    print(f"⚠️ ChromaDB not available: {e}")
    print("RAG functionality will be limited. Install chromadb with Python 3.10-3.12 for full functionality.")

from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ChromaVectorStore:
    """
    ChromaDB vector store for document embeddings and semantic search
    Fixes binary/hex output issues by ensuring proper text encoding
    """
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Initialize ChromaDB vector store
        
        Args:
            persist_directory: Directory to persist ChromaDB data
        """
        if not CHROMADB_AVAILABLE:
            logger.warning("ChromaDB not available - RAG functionality disabled")
            self.client = None
            self.collection = None
            return
            
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB client with persistence
        logger.info(f"Initializing ChromaDB at: {self.persist_directory}")
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Get or create collection with default embedding function
        self.collection = self.client.get_or_create_collection(
            name="shiksha_setu_documents",
            metadata={"hnsw:space": "cosine"}  # Use cosine similarity
        )
        
        logger.info(f"ChromaDB initialized with {self.collection.count()} documents")
    
    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        """
        Add documents to ChromaDB with proper text encoding
        
        Args:
            texts: List of document texts
            metadatas: List of metadata dictionaries
            ids: List of document IDs
        """
        if not CHROMADB_AVAILABLE or not self.collection:
            logger.warning("ChromaDB not available - skipping document addition")
            return
            
        logger.info(f"Adding {len(texts)} documents to ChromaDB...")
        
        # Clean and ensure proper text encoding (fixes binary/hex issues)
        cleaned_texts = []
        for text in texts:
            if isinstance(text, bytes):
                # Decode bytes to string
                cleaned_text = text.decode('utf-8', errors='replace')
            elif isinstance(text, str):
                # Ensure clean UTF-8 string
                cleaned_text = text.encode('utf-8', errors='replace').decode('utf-8')
            else:
                # Convert other types to string
                cleaned_text = str(text)
            cleaned_texts.append(cleaned_text)
        
        # Add to ChromaDB collection (ChromaDB handles embeddings automatically)
        self.collection.add(
            documents=cleaned_texts,
            metadatas=metadatas,
            ids=ids
        )
        
        logger.info(f"✓ Added {len(texts)} documents (total: {self.collection.count()})")
    
    def search(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, List]:
        """
        Search for similar documents using ChromaDB
        
        Args:
            query: Search query (string)
            n_results: Number of results to return
            filter_metadata: Optional metadata filter
        
        Returns:
            Dictionary with documents, metadatas, and distances
        """
        if not CHROMADB_AVAILABLE or not self.collection:
            logger.warning("ChromaDB not available - returning empty search results")
            return {'documents': [[]], 'metadatas': [[]], 'distances': [[]]}
            
        if self.collection.count() == 0:
            return {'documents': [[]], 'metadatas': [[]], 'distances': [[]]}
        
        # Ensure query is clean string
        if isinstance(query, bytes):
            query = query.decode('utf-8', errors='replace')
        elif not isinstance(query, str):
            query = str(query)
        
        # Query ChromaDB
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=filter_metadata  # ChromaDB where filter
        )
        
        # Return in consistent format
        return {
            'documents': results['documents'],
            'metadatas': results['metadatas'],
            'distances': results['distances']
        }
    
    def delete_collection(self, manual_id: str):
        """
        Delete all documents for a specific manual
        
        Args:
            manual_id: The manual ID to delete
        """
        try:
            # Get all documents with this manual_id
            results = self.collection.get(
                where={"manual_id": manual_id}
            )
            
            if results['ids']:
                # Delete by IDs
                self.collection.delete(ids=results['ids'])
                logger.info(f"✓ Deleted {len(results['ids'])} documents for manual {manual_id}")
            else:
                logger.info(f"No documents found for manual {manual_id}")
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
    
    def get_collection_size(self) -> int:
        """Get the number of documents in ChromaDB"""
        return self.collection.count()
    
    def get_all_documents(self, limit: int = 100) -> Dict[str, List]:
        """
        Get all documents from the collection
        
        Args:
            limit: Maximum number of documents to return
        
        Returns:
            Dictionary with documents, metadatas, and ids
        """
        try:
            results = self.collection.get(limit=limit)
            return {
                'documents': results['documents'],
                'metadatas': results['metadatas'],
                'ids': results['ids']
            }
        except Exception as e:
            logger.error(f"Error getting documents: {e}")
            return {'documents': [], 'metadatas': [], 'ids': []}
