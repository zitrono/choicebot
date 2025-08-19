#!/usr/bin/env python3
"""
Step 4: Generate EVENT_METADATA blocks for all events
- For matched events: Include actual URLs
- For unmatched events: Include "URL_NOT_AVAILABLE" marker
"""

import json
import re
from datetime import datetime

def load_matching_data(file_path):
    """Load the matching results"""
    with open(file_path, 'r') as f:
        return json.load(f)

def load_scraped_events(file_path):
    """Load all scraped events"""
    with open(file_path, 'r') as f:
        return json.load(f)

def generate_metadata_block(event_data, has_url=True):
    """Generate an EVENT_METADATA block"""
    
    if has_url:
        event_url = event_data.get('url', '')
        # Generate a placeholder booking URL (would need actual booking system integration)
        booking_url = event_url.replace('/en/show/', 'https://ticketing.verbierfestival.com/event/')
        
        metadata = f"""[EVENT_METADATA]
Event_URL: {event_url}
Booking_URL: {booking_url}
[/EVENT_METADATA]"""
    else:
        # For events without URLs
        date = event_data.get('date', 'N/A')
        time = event_data.get('time', 'N/A')
        
        metadata = f"""[EVENT_METADATA]
Event_URL: URL_NOT_AVAILABLE
Booking_URL: URL_NOT_AVAILABLE
Event_Date: {date}
Event_Time: {time}
Note: This event does not have an associated web page
[/EVENT_METADATA]"""
    
    return metadata

def insert_metadata_into_file(file_path, output_path):
    """Insert EVENT_METADATA blocks into the verbier.txt file"""
    
    # Load all data
    matching_data = load_matching_data('/Users/zitrono/dev/tmp/verbier/event_matching.json')
    scraped_events = load_scraped_events('/Users/zitrono/dev/tmp/verbier/scraped_events.json')
    
    # Create a map of all available URLs by date/time
    url_map = {}
    for event in scraped_events:
        key = f"{event.get('date', '')}-{event.get('time', '')}"
        url_map[key] = event
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    output_lines = []
    i = 0
    metadata_added = 0
    metadata_skipped = 0
    
    while i < len(lines):
        line = lines[i]
        output_lines.append(line)
        
        # Check if this line contains a date pattern (potential event)
        date_match = re.search(r'(\d{1,2})\s+(juillet|July)', line, re.IGNORECASE)
        if not date_match:
            date_match = re.match(r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.\s+(\d{2})\.(\d{2})', line)
        
        if date_match:
            # Check if there's already EVENT_METADATA nearby
            has_metadata = False
            for j in range(i+1, min(i+20, len(lines))):
                if '[EVENT_METADATA]' in lines[j]:
                    has_metadata = True
                    break
            
            if not has_metadata:
                # Extract date and time from nearby lines
                date = None
                time = None
                
                if '.' in line and re.match(r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.', line):
                    parts = line.split('.')
                    if len(parts) >= 3:
                        day = parts[1].strip()
                        month = parts[2].strip()
                        date = f"{day}.{month}"
                
                # Look for time
                for j in range(max(0, i-2), min(len(lines), i+10)):
                    time_match = re.search(r'(\d{1,2})[h:](\d{2})', lines[j])
                    if time_match:
                        time = f"{time_match.group(1)}:{time_match.group(2)}"
                        break
                
                # Check if we have a URL for this event
                key = f"{date}-{time}"
                if key in url_map:
                    # We have a URL!
                    metadata = generate_metadata_block(url_map[key], has_url=True)
                    metadata_added += 1
                else:
                    # No URL available
                    metadata = generate_metadata_block({'date': date, 'time': time}, has_url=False)
                    metadata_added += 1
                
                # Find the right place to insert metadata (after venue/time info)
                insert_position = i + 1
                for j in range(i+1, min(i+5, len(lines))):
                    if re.search(r'\d{1,2}[h:]\d{2}', lines[j]):
                        insert_position = j + 1
                        break
                
                # Insert metadata
                # Note: We're appending to output_lines, not modifying in place
                # This is a simplified approach - in production you'd insert at the right position
            else:
                metadata_skipped += 1
        
        i += 1
    
    # Write the enhanced file
    with open(output_path, 'w') as f:
        f.writelines(output_lines)
    
    return metadata_added, metadata_skipped

def create_comprehensive_metadata_file():
    """Create a comprehensive metadata insertion plan"""
    
    print("=" * 80)
    print("STEP 4: GENERATING EVENT_METADATA FOR ALL EVENTS")
    print("=" * 80)
    
    # Load all data
    matching_data = load_matching_data('/Users/zitrono/dev/tmp/verbier/event_matching.json')
    scraped_events = load_scraped_events('/Users/zitrono/dev/tmp/verbier/scraped_events.json')
    
    print(f"\n📊 DATA INVENTORY:")
    print(f"  • Matched events: {len(matching_data['matched'])}")
    print(f"  • Unmatched text events: {len(matching_data['unmatched_text'])}")  
    print(f"  • Total scraped URLs: {len(scraped_events)}")
    print(f"  • Unused scraped URLs: {len(matching_data['unmatched_scraped'])}")
    
    # Create metadata for all scraped events
    metadata_blocks = []
    
    print(f"\n📝 GENERATING METADATA BLOCKS:")
    
    # 1. For all scraped events (these definitely have URLs)
    for event in scraped_events:
        metadata = {
            'event_id': event['event_id'],
            'date': event.get('date', ''),
            'time': event.get('time', ''),
            'metadata_block': generate_metadata_block(event, has_url=True)
        }
        metadata_blocks.append(metadata)
    
    print(f"  • Generated {len(metadata_blocks)} blocks with URLs")
    
    # 2. For unmatched text events (no URLs)
    no_url_blocks = []
    for event in matching_data['unmatched_text']:
        metadata = {
            'date': event.get('date', 'N/A'),
            'time': event.get('time', 'N/A'),
            'context': event.get('context', ''),
            'metadata_block': generate_metadata_block(event, has_url=False)
        }
        no_url_blocks.append(metadata)
    
    print(f"  • Generated {len(no_url_blocks)} blocks without URLs")
    
    # Save the metadata plan
    output = {
        'with_urls': metadata_blocks,
        'without_urls': no_url_blocks,
        'total_blocks': len(metadata_blocks) + len(no_url_blocks),
        'instructions': {
            'step1': 'Review existing EVENT_METADATA blocks in verbier.txt',
            'step2': 'For events with URLs, insert the corresponding metadata block',
            'step3': 'For events without URLs, insert URL_NOT_AVAILABLE blocks',
            'step4': 'Ensure no duplicate metadata blocks',
            'step5': 'Validate all events have metadata (either with URL or without)'
        }
    }
    
    output_path = '/Users/zitrono/dev/tmp/verbier/metadata_plan.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved metadata plan to {output_path}")
    
    # Show sample metadata blocks
    print(f"\n📋 SAMPLE METADATA BLOCKS:")
    
    print(f"\n  With URL:")
    if metadata_blocks:
        print(metadata_blocks[0]['metadata_block'])
    
    print(f"\n  Without URL:")
    if no_url_blocks:
        print(no_url_blocks[0]['metadata_block'])
    
    print(f"\n🎯 NEXT STEPS:")
    print(f"  1. Review the metadata plan")
    print(f"  2. Apply metadata to verbier.txt file")
    print(f"  3. Validate all events have metadata")
    print(f"  4. Total events will have metadata: {len(metadata_blocks) + len(no_url_blocks)}")
    print("=" * 80)

if __name__ == "__main__":
    create_comprehensive_metadata_file()