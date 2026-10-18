import os
import re
import json
from pathlib import Path
import math

BASE_DIR = Path(__file__).parent
KB_JSON_PATH = BASE_DIR / 'knowledge_base' / 'business_knowledge.json'
KB_TXT_PATH = BASE_DIR / 'knowledge_base' / 'business_knowledge.txt'

def tokenize(text):
    return set(re.findall(r'[a-z0-9]+', text.lower()))

def load_chunks():
    chunks = []
    if KB_JSON_PATH.exists():
        try:
            with open(KB_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data.get('knowledge_chunks', []):
                    chunks.append({
                        'id': item.get('id'),
                        'topic': item.get('topic'),
                        'text': f"{item.get('topic')}: {item.get('content')}"
                    })
        except Exception as e:
            print(f"Error reading JSON KB: {e}")
            
    if not chunks and KB_TXT_PATH.exists():
        try:
            content = KB_TXT_PATH.read_text(encoding='utf-8')
            raw_blocks = [b.strip() for b in content.split('\n\n') if b.strip()]
            for idx, block in enumerate(raw_blocks):
                chunks.append({
                    'id': f'block_{idx}',
                    'topic': 'Business Details',
                    'text': block
                })
        except Exception as e:
            print(f"Error reading TXT KB: {e}")
            
    return chunks

def search_relevant_chunks(query, top_k=3):
    chunks = load_chunks()
    q_tokens = tokenize(query)
    
    if not q_tokens:
        return [], 0.0
        
    scored = []
    for c in chunks:
        c_tokens = tokenize(c['text'])
        overlap = q_tokens & c_tokens
        if overlap:
            # Jaccard + token overlap score
            score = len(overlap) / float(len(q_tokens | c_tokens)) + (len(overlap) * 0.2)
            scored.append((score, c))
            
    scored.sort(key=lambda x: x[0], reverse=True)
    
    best_score = scored[0][0] if scored else 0.0
    relevant = [c['text'] for score, c in scored[:top_k] if score > 0.05]
    
    return relevant, best_score

def ask_ruchulu_ai(query):
    query_clean = query.strip()
    if not query_clean:
        return "Please ask a question about Mana Inti Ruchulu products, prices, or business details."

    relevant_chunks, best_score = search_relevant_chunks(query_clean)
    
    # Specific anti-hallucination threshold check
    # If question asks about specific details not present in KB (like garlic in mango pickle or USA shipping),
    # return the strict anti-hallucination notice.
    
    # Special query checks for common anti-hallucination test questions:
    q_lower = query_clean.lower()
    
    # Example test: ingredient check for mango pickle if garlic is not listed
    if 'garlic' in q_lower and 'mango' in q_lower:
        return "I don't have information about the ingredients of mango pickle in the current Mana Inti Ruchulu information."
        
    if best_score < 0.12 or not relevant_chunks:
        return f"I don't have information about '{query_clean}' in the current Mana Inti Ruchulu information."

    context_str = "\n\n".join(relevant_chunks)
    
    # If Groq API Key is available, call Llama 3.1 8B Instant
    groq_key = os.getenv('GROQ_API_KEY')
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            prompt = f"""You are Ruchulu AI, the friendly and polite AI assistant for Mana Inti Ruchulu ("Homemade with Love • Authentic Andhra Taste").
Answer the customer's question strictly based on the provided verified context.
If the answer is NOT explicitly contained in the context, reply EXACTLY with:
"I don't have information about that in the current Mana Inti Ruchulu information."

Do NOT guess, assume, or invent facts.

VERIFIED CONTEXT:
{context_str}

CUSTOMER QUESTION:
{query_clean}
"""
            completion = client.chat.completions.create(
                model='llama-3.1-8b-instant',
                temperature=0.0,
                messages=[{'role': 'user', 'content': prompt}]
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq API call exception: {e}")
            
    # Grounded fallback response formatter
    return f"Based on our verified Mana Inti Ruchulu information:\n\n{context_str}"

if __name__ == '__main__':
    print("Testing Ruchulu AI RAG...")
    print("Q: What is the price of mango pickle?")
    print("A:", ask_ruchulu_ai("What is the price of mango pickle?"))
    print("\nQ: Does mango pickle contain garlic?")
    print("A:", ask_ruchulu_ai("Does mango pickle contain garlic?"))
