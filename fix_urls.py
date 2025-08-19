#!/usr/bin/env python3
"""
Fix URL issues in verbier.txt:
1. Find and report the 8 booking URLs missing productId
2. Identify the 18 duplicate EVENT_METADATA blocks
"""

import re
from collections import defaultdict

def analyze_issues(file_path):
    """Analyze the file to find specific issues"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find all EVENT_METADATA blocks with their positions
    metadata_pattern = r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]'
    blocks = list(re.finditer(metadata_pattern, content, re.DOTALL))
    
    print("=" * 80)
    print("URL ISSUES ANALYSIS")
    print("=" * 80)
    
    # Track seen URLs to find duplicates
    seen_events = {}
    duplicates = []
    broken_bookings = []
    
    for i, match in enumerate(blocks, 1):
        block_content = match.group(1)
        
        # Extract Event URL
        event_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', block_content)
        event_url = event_match.group(1).strip() if event_match else None
        
        # Extract Booking URL
        booking_match = re.search(r'Booking_URL:\s*(https?://[^\s\n]+)', block_content)
        booking_url = booking_match.group(1).strip() if booking_match else None
        
        # Find event title (usually appears before EVENT_METADATA)
        start_pos = max(0, match.start() - 500)
        context = content[start_pos:match.start()]
        lines = context.split('\n')
        event_title = None
        for line in reversed(lines):
            if line.strip() and not line.startswith('[') and len(line) > 10:
                event_title = line.strip()
                break
        
        # Check for duplicates
        if event_url in seen_events:
            duplicates.append({
                'block': i,
                'duplicate_of': seen_events[event_url],
                'event_url': event_url,
                'title': event_title
            })
        else:
            seen_events[event_url] = i
        
        # Check for broken booking URLs (missing productId)
        if booking_url and 'productId' not in booking_url:
            broken_bookings.append({
                'block': i,
                'event_url': event_url,
                'booking_url': booking_url,
                'title': event_title
            })
    
    # Report broken booking URLs
    print("\n🔴 BOOKING URLs MISSING productId (8 found):")
    print("-" * 80)
    for item in broken_bookings:
        print(f"\nBlock #{item['block']}:")
        print(f"  Event: {item['title']}")
        print(f"  Event URL: {item['event_url']}")
        print(f"  Broken Booking URL: {item['booking_url']}")
    
    # Report duplicates
    print("\n\n🔴 DUPLICATE EVENT_METADATA BLOCKS (18 found):")
    print("-" * 80)
    for item in duplicates:
        print(f"\nBlock #{item['block']} is duplicate of Block #{item['duplicate_of']}:")
        print(f"  Event: {item['title']}")
        print(f"  URL: {item['event_url']}")
    
    print("\n" + "=" * 80)
    print("RECOMMENDATIONS:")
    print("-" * 80)
    print("1. For broken booking URLs:")
    print("   - These appear to be from events that weren't fully scraped")
    print("   - Missing productId parameter makes them invalid")
    print("   - Suggest: Remove these EVENT_METADATA blocks entirely")
    print("\n2. For duplicate blocks:")
    print("   - Same event appears multiple times in the file")
    print("   - Suggest: Keep first occurrence, remove duplicates")
    print("\n3. Since this is historical data (2024 festival):")
    print("   - All booking URLs will show errors (events are past)")
    print("   - This is expected behavior for a demo app")
    print("   - Consider adding a note in the system prompt about this")
    print("=" * 80)
    
    return broken_bookings, duplicates

if __name__ == "__main__":
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    broken, dupes = analyze_issues(file_path)
    
    print(f"\n📊 SUMMARY:")
    print(f"  • Broken booking URLs to fix: {len(broken)}")
    print(f"  • Duplicate blocks to remove: {len(dupes)}")
    print(f"  • Total issues to resolve: {len(broken) + len(dupes)}")