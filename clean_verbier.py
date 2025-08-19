#!/usr/bin/env python3
"""
Clean up verbier.txt file:
1. Remove EVENT_METADATA blocks with broken booking URLs
2. Remove duplicate EVENT_METADATA blocks
"""

import re
from datetime import datetime

def clean_verbier_file(input_path, output_path):
    """Clean the verbier.txt file"""
    
    with open(input_path, 'r') as f:
        content = f.read()
    
    # Track what we're doing
    removed_broken = 0
    removed_duplicates = 0
    
    # Find all EVENT_METADATA blocks
    metadata_pattern = r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]'
    
    # Track seen event URLs to identify duplicates
    seen_event_urls = set()
    blocks_to_keep = []
    
    # Process each block
    for match in re.finditer(metadata_pattern, content, re.DOTALL):
        block_content = match.group(0)  # Full block including tags
        inner_content = match.group(1)  # Content between tags
        
        # Extract Event URL
        event_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', inner_content)
        event_url = event_match.group(1).strip() if event_match else None
        
        # Extract Booking URL
        booking_match = re.search(r'Booking_URL:\s*(https?://[^\s\n]+)', inner_content)
        booking_url = booking_match.group(1).strip() if booking_match else None
        
        # Skip if booking URL is broken (missing productId)
        if booking_url and 'productId' not in booking_url:
            removed_broken += 1
            print(f"  ❌ Removing broken booking URL block: {event_url}")
            continue
        
        # Skip if this is a duplicate
        if event_url in seen_event_urls:
            removed_duplicates += 1
            print(f"  ❌ Removing duplicate block: {event_url}")
            continue
        
        # Keep this block
        seen_event_urls.add(event_url)
        blocks_to_keep.append({
            'block': block_content,
            'start': match.start(),
            'end': match.end()
        })
    
    # Now rebuild the content, preserving everything except removed blocks
    new_content = content
    
    # Remove blocks in reverse order to maintain positions
    all_matches = list(re.finditer(metadata_pattern, content, re.DOTALL))
    blocks_to_remove = []
    
    for match in all_matches:
        inner_content = match.group(1)
        
        # Check if this should be removed
        event_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', inner_content)
        event_url = event_match.group(1).strip() if event_match else None
        
        booking_match = re.search(r'Booking_URL:\s*(https?://[^\s\n]+)', inner_content)
        booking_url = booking_match.group(1).strip() if booking_match else None
        
        should_remove = False
        
        # Check for broken booking URL
        if booking_url and 'productId' not in booking_url:
            should_remove = True
        
        # Check for duplicate (need to track first occurrences)
        # This is handled differently - we need a two-pass approach
        
        if should_remove:
            blocks_to_remove.append((match.start(), match.end()))
    
    # Actually, let's use a simpler approach - create a new file with only good blocks
    print("\n🔧 CLEANING VERBIER.TXT FILE")
    print("=" * 80)
    
    # Split content into parts before, between, and after EVENT_METADATA blocks
    parts = []
    last_end = 0
    
    # Track which blocks to keep
    seen_urls = set()
    
    for match in re.finditer(metadata_pattern, content, re.DOTALL):
        # Add content before this block
        parts.append(content[last_end:match.start()])
        
        inner_content = match.group(1)
        
        # Extract URLs
        event_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', inner_content)
        event_url = event_match.group(1).strip() if event_match else None
        
        booking_match = re.search(r'Booking_URL:\s*(https?://[^\s\n]+)', inner_content)
        booking_url = booking_match.group(1).strip() if booking_match else None
        
        # Decide whether to keep this block
        keep = True
        
        # Skip if booking URL is broken
        if booking_url and 'productId' not in booking_url:
            keep = False
            removed_broken += 1
            print(f"  ❌ Removing broken: {event_url}")
        
        # Skip if duplicate
        elif event_url in seen_urls:
            keep = False
            removed_duplicates += 1
            print(f"  ❌ Removing duplicate: {event_url}")
        
        # Keep this block
        if keep:
            parts.append(match.group(0))
            seen_urls.add(event_url)
            print(f"  ✅ Keeping: {event_url}")
        
        last_end = match.end()
    
    # Add remaining content
    parts.append(content[last_end:])
    
    # Join all parts
    new_content = ''.join(parts)
    
    # Add a header comment about the cleaning
    header = f"""# VERBIER FESTIVAL DATA
# Cleaned on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
# Note: This contains historical data from the 2024 festival.
# Booking URLs will show errors as the events have already occurred.
# This is expected behavior for the demo application.

"""
    
    # Write the cleaned content
    with open(output_path, 'w') as f:
        f.write(header + new_content)
    
    print("\n" + "=" * 80)
    print("📊 CLEANING SUMMARY:")
    print(f"  • Broken URLs removed: {removed_broken}")
    print(f"  • Duplicates removed: {removed_duplicates}")
    print(f"  • Total blocks removed: {removed_broken + removed_duplicates}")
    print(f"  • Clean blocks remaining: {len(seen_urls)}")
    print("=" * 80)
    
    return removed_broken, removed_duplicates

if __name__ == "__main__":
    input_file = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    output_file = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier_clean.txt'
    
    # Create backup first
    import shutil
    backup_file = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier_backup_before_cleaning.txt'
    shutil.copy(input_file, backup_file)
    print(f"✅ Backup created: {backup_file}\n")
    
    # Clean the file
    broken, dupes = clean_verbier_file(input_file, output_file)
    
    print(f"\n✅ Cleaned file saved to: {output_file}")
    print(f"📝 Original file backed up to: {backup_file}")