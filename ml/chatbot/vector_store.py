class VectorStore:
    """
    A simple in-memory vector store mock.
    """
    def __init__(self):
        self.documents = []
        self.embeddings = []

    def add_document(self, text, embedding):
        self.documents.append(text)
        self.embeddings.append(embedding)

    def search(self, query_embedding, top_k=3):
        # Mock search: simply return the first top_k documents
        return self.documents[:top_k]

store = VectorStore()
