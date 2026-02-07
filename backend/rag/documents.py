from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
default_vector_store = None

if api_key:
    index_name = "dianai"
    pc = Pinecone(api_key=api_key)
    
    if not pc.has_index(index_name):
        pc.create_index(
            name=index_name,
            dimension=3072,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    else:
        print(f"Index '{index_name}' already exists, skipping creation.")
    
    index = pc.Index(index_name)
    embeddings = AzureOpenAIEmbeddings(model="text-embedding-3-large")
    default_vector_store = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        namespace="default",
        text_key="text"
    )
    
    stats = index.describe_index_stats()
    vector_count = stats.get("namespaces", {}).get("default", {}).get("vector_count", 0)
    
    if vector_count == 0:
        loader = DirectoryLoader(
            "rag/dianai/",
            glob="*pdf",
            loader_cls=PyPDFLoader
        )
        default_docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=150)
        default_texts = text_splitter.split_documents(default_docs)
        default_vector_store.add_documents(default_texts)
    else:
        print(f"Default namespace already exists, with {vector_count}, skipping storage.")

def answer_query(query):
    if not default_vector_store:
        raise ValueError("Pinecone not initialized. PINECONE_API_KEY is required.")
    results = default_vector_store.similarity_search(query, k=6)
    return results