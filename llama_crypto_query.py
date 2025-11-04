#!/usr/bin/env python3
"""
Llama Crypto Query Script
Dieses Skript ruft aktuelle Kryptokurse aus Supabase ab und übergibt sie
als Kontext an einen lokalen Llama-LLM-Server, um Benutzerfragen zu beantworten.
"""
import os
import argparse
import requests
from supabase import create_client, Client

# Supabase-Konfiguration aus Umgebungsvariablen
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Llama-Server-Konfiguration (lokal)
LLAMA_API_URL = os.getenv("LLAMA_API_URL", "http://localhost:11434/api/generate")
LLAMA_MODEL = os.getenv("LLAMA_MODEL", "llama2")


def get_crypto_data() -> list:
    """
    Ruft aktuelle Kryptokurse aus der Supabase-Datenbank ab.
    
    Returns:
        Liste von Krypto-Datensätzen
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise ValueError("SUPABASE_URL und SUPABASE_ANON_KEY müssen als Umgebungsvariablen gesetzt sein.")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    try:
        # Annahme: Tabelle 'crypto_prices' mit Spalten: symbol, price, timestamp
        response = supabase.table('crypto_prices').select('*').order('timestamp', desc=True).limit(50).execute()
        return response.data
    except Exception as e:
        print(f"Fehler beim Abrufen der Krypto-Daten: {e}")
        return []


def format_crypto_context(data: list) -> str:
    """
    Formatiert Krypto-Daten als Kontext für den LLM.
    
    Args:
        data: Liste von Krypto-Datensätzen
        
    Returns:
        Formatierter String mit Krypto-Informationen
    """
    if not data:
        return "Keine Krypto-Daten verfügbar."
    
    context = "Aktuelle Kryptokurse:\n\n"
    for item in data:
        symbol = item.get('symbol', 'N/A')
        price = item.get('price', 'N/A')
        timestamp = item.get('timestamp', 'N/A')
        context += f"- {symbol}: ${price} (Stand: {timestamp})\n"
    
    return context


def query_llama(prompt: str, context: str, llama_url: str) -> str:
    """
    Sendet eine Anfrage mit Kontext an den lokalen Llama-Server.
    
    Args:
        prompt: Benutzerfrage
        context: Zusätzlicher Kontext (Krypto-Daten)
        llama_url: URL des Llama-Servers
        
    Returns:
        Antwort des LLM
    """
    full_prompt = f"{context}\n\nFrage: {prompt}\n\nAntwort:"
    
    payload = {
        "model": LLAMA_MODEL,
        "prompt": full_prompt,
        "stream": False
    }
    
    try:
        response = requests.post(llama_url, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result.get('response', 'Keine Antwort erhalten.')
    except requests.exceptions.RequestException as e:
        return f"Fehler bei der Kommunikation mit dem Llama-Server: {e}"


def main():
    """
    Hauptfunktion: Ruft Krypto-Daten ab und beantwortet Benutzerfrage.
    """
    parser = argparse.ArgumentParser(
        description='Kryptokurse von Supabase abrufen und via Llama LLM abfragen',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Beispiel:
  python llama_crypto_query.py --question "Welche Kryptowährung hat den höchsten Preis?"
  python llama_crypto_query.py -q "Was ist der Bitcoin-Preis?" --llama-url http://localhost:11434/api/generate
        """
    )
    
    parser.add_argument(
        '-q', '--question',
        type=str,
        required=True,
        help='Die Frage an den Llama LLM über Kryptokurse'
    )
    
    parser.add_argument(
        '--llama-url',
        type=str,
        default=LLAMA_API_URL,
        help=f'URL des Llama-API-Servers (Standard: {LLAMA_API_URL})'
    )
    
    args = parser.parse_args()
    
    print("Rufe Krypto-Daten von Supabase ab...")
    crypto_data = get_crypto_data()
    
    if not crypto_data:
        print("Keine Daten verfügbar. Beende.")
        return 1
    
    print(f"Gefunden: {len(crypto_data)} Krypto-Datensätze")
    
    context = format_crypto_context(crypto_data)
    
    print(f"\nSende Anfrage an Llama-Server ({args.llama_url})...")
    print(f"Frage: {args.question}\n")
    
    answer = query_llama(args.question, context, args.llama_url)
    
    print("Antwort:")
    print(answer)
    
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
