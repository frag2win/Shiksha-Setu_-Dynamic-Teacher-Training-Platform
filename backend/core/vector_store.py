"""
Simple Vector Store using sentence-transformers and pickle
Alternative to ChromaDB for Python 3.14 compatibility
"""

import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class SimpleVectorStore:
    """
    A simple vector store for document embeddings and semantic search
    Uses sentence-transformers for embeddings and cosine similarity for search
    """
    
    def __init__(self, persist_directory: str = "./vector_store", model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the vector store
        
        Args:
            persist_directory: Directory to persist the vector store
            model_name: Sentence transformer model name
        """
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        # Load embedding model
        print(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        
        # Storage for documents and embeddings
        self.documents: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        
        # Load existing data if available
        self._load()
    
    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        """
        Add documents to the vector store
        
        Args:
            texts: List of document texts
            metadatas: List of metadata dictionaries
            ids: List of document IDs
        """
        print(f"Adding {len(texts)} documents to vector store...")
        
        # Generate embeddings
        new_embeddings = self.model.encode(texts, show_progress_bar=True)
        
        # Add to storage
        for text, metadata, doc_id, embedding in zip(texts, metadatas, ids, new_embeddings):
            self.documents.append({
                'id': doc_id,
                'text': text,
                'metadata': metadata
            })
        
        # Update embeddings matrix
        if self.embeddings is None:
            self.embeddings = new_embeddings
        else:
            self.embeddings = np.vstack([self.embeddings, new_embeddings])
        
        # Persist
        self._save()
        print(f"✓ Added {len(texts)} documents (total: {len(self.documents)})")
    
    def search(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, List]:
        """
        Search for similar documents
        
        Args:
            query: Search query
            n_results: Number of results to return
            filter_metadata: Optional metadata filter
        
        Returns:
            Dictionary with documents, metadatas, and distances
        """
        if len(self.documents) == 0:
            return {'documents': [], 'metadatas': [], 'distances': []}
        
        # Generate query embedding
        query_embedding = self.model.encode([query])[0]
        
        # Calculate similarities
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        
        # Apply metadata filter if provided
        valid_indices = []
        for idx, doc in enumerate(self.documents):
            if filter_metadata:
                match = all(doc['metadata'].get(k) == v for k, v in filter_metadata.items())
                if match:
                    valid_indices.append(idx)
            else:
                valid_indices.append(idx)
        
        if not valid_indices:
            return {'documents': [], 'metadatas': [], 'distances': []}
        
        # Get top results from valid indices
        valid_similarities = [(idx, similarities[idx]) for idx in valid_indices]
        valid_similarities.sort(key=lambda x: x[1], reverse=True)
        top_results = valid_similarities[:n_results]
        
        # Prepare results
        results = {
            'documents': [[self.documents[idx]['text'] for idx, _ in top_results]],
            'metadatas': [[self.documents[idx]['metadata'] for idx, _ in top_results]],
            'distances': [[1 - sim for _, sim in top_results]]  # Convert similarity to distance
        }
        
        return results
    
    def delete_collection(self, manual_id: str):
        """
        Delete all documents for a specific manual
        
        Args:
            manual_id: The manual ID to delete
        """
        # Find indices to keep
        keep_indices = [i for i, doc in enumerate(self.documents) 
                       if doc['metadata'].get('manual_id') != manual_id]
        
        if len(keep_indices) == len(self.documents):
            return  # Nothing to delete
        
        # Filter documents and embeddings
        self.documents = [self.documents[i] for i in keep_indices]
        self.embeddings = self.embeddings[keep_indices] if self.embeddings is not None else None
        
        # Persist
        self._save()
        print(f"✓ Deleted documents for manual {manual_id}")
    
    def get_collection_size(self) -> int:
        """Get the number of documents in the store"""
        return len(self.documents)
    
    def _save(self):
        """Save the vector store to disk"""
        data = {
            'documents': self.documents,
            'embeddings': self.embeddings
        }
        with open(self.persist_directory / 'vectorstore.pkl', 'wb') as f:
            pickle.dump(data, f)
    
    def _load(self):
        """Load the vector store from disk"""
        store_file = self.persist_directory / 'vectorstore.pkl'
        if store_file.exists():
            try:
                with open(store_file, 'rb') as f:
                    data = pickle.load(f)
                self.documents = data.get('documents', [])
                self.embeddings = data.get('embeddings', None)
                print(f"✓ Loaded {len(self.documents)} documents from disk")
            except Exception as e:
                print(f"Warning: Could not load vector store: {e}")
                self.documents = []
                self.embeddings = None
