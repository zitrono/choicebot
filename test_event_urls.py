#!/usr/bin/env python3
"""
Extract and list all Event URLs from the cleaned verbier.txt for testing
"""

import re

def extract_event_urls(file_path):
    """Extract all Event URLs from the file"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find all EVENT_METADATA blocks
    metadata_blocks = re.findall(r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]', content, re.DOTALL)
    
    event_urls = []
    
    for block in metadata_blocks:
        # Extract Event_URL
        event_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', block)
        if event_match:
            url = event_match.group(1).strip()
            event_urls.append(url)
    
    return event_urls

if __name__ == "__main__":
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    urls = extract_event_urls(file_path)
    
    print(f"Found {len(urls)} Event URLs to test:\n")
    
    for i, url in enumerate(urls, 1):
        print(f"{i}. {url}")
    
    print(f"\nTotal: {len(urls)} event URLs")