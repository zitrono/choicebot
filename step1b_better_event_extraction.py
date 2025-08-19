#!/usr/bin/env python3
"""
Step 1b: Better event extraction using more sophisticated patterns
"""

import re
import json

def extract_events_advanced(file_path):
    """Extract events using multiple detection strategies"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    events = []
    
    # Strategy 1: Look for EVENT_METADATA blocks first (these are confirmed events)
    metadata_pattern = r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]'
    metadata_blocks = re.findall(metadata_pattern, content, re.DOTALL)
    
    for block in metadata_blocks:
        event_url_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', block)
        if event_url_match:
            # Extract event ID from URL
            url = event_url_match.group(1)
            event_id = url.split('/')[-1].rstrip('/')
            
            # Try to find context around this metadata block
            block_start = content.find(block)
            context_start = max(0, block_start - 500)
            context = content[context_start:block_start]
            
            event = {
                'type': 'confirmed',
                'event_id': event_id,
                'url': url,
                'has_metadata': True
            }
            
            # Extract date from event_id (format: vf25-07-17-1830)
            date_match = re.search(r'vf25-(\d{2})-(\d{2})-(\d{4})', event_id)
            if date_match:
                month, day, time = date_match.groups()
                event['date'] = f"{day} juillet"
                event['time'] = f"{time[:2]}h{time[2:]}"
            
            events.append(event)
    
    # Strategy 2: Look for program listing patterns
    # Many events are listed with consistent formatting
    
    # Pattern: "Date • Time • Venue" followed by artists/program
    program_pattern = r'(\d{1,2}\s+(?:juillet|July|july|JUILLET))[^\n]*?(\d{1,2}h\d{0,2})[^\n]*?(?:•|–|\|)([^\n]+)'
    
    for match in re.finditer(program_pattern, content, re.IGNORECASE):
        date, time, rest = match.groups()
        
        event = {
            'type': 'extracted',
            'date': date,
            'time': time,
            'raw_line': match.group(0),
            'position': match.start(),
            'has_metadata': False
        }
        
        # Try to extract venue
        venues = ['Salle des Combins', 'Église', 'Victoria Hall', 'Medran', 
                  'Cinéma', 'Place du Village', 'Chalet Essert', 'Jardin']
        for venue in venues:
            if venue.lower() in rest.lower():
                event['venue'] = venue
                break
        
        events.append(event)
    
    # Strategy 3: Look for concert headers
    concert_headers = [
        r'OPENING CONCERT',
        r'CLOSING CONCERT', 
        r'GALA CONCERT',
        r'RÉCITAL',
        r'MASTERCLASS',
        r'ACADEMY PRESENTS',
        r'CHAMBER MUSIC',
        r'FESTIVAL ORCHESTRA'
    ]
    
    for header in concert_headers:
        for match in re.finditer(header, content, re.IGNORECASE):
            # Look for date/time near this header
            context_start = match.start()
            context_end = min(match.end() + 300, len(content))
            context = content[context_start:context_end]
            
            date_match = re.search(r'(\d{1,2})\s+(juillet|July)', context, re.IGNORECASE)
            time_match = re.search(r'(\d{1,2}h\d{0,2})', context)
            
            if date_match or time_match:
                event = {
                    'type': 'header',
                    'title': match.group(0),
                    'position': match.start(),
                    'has_metadata': False
                }
                
                if date_match:
                    event['date'] = date_match.group(0)
                if time_match:
                    event['time'] = time_match.group(0)
                
                events.append(event)
    
    # Strategy 4: Look for patterns like "Concert du 17 juillet"
    french_pattern = r'(?:Concert|Récital|Masterclass)\s+du\s+(\d{1,2}\s+juillet)'
    
    for match in re.finditer(french_pattern, content, re.IGNORECASE):
        event = {
            'type': 'french_format',
            'date': match.group(1),
            'title': match.group(0),
            'position': match.start(),
            'has_metadata': False
        }
        events.append(event)
    
    return events

def deduplicate_events(events):
    """Remove duplicate events based on date/time/position"""
    
    seen = set()
    unique = []
    
    for event in events:
        # Create a key for deduplication
        key_parts = []
        
        if 'date' in event:
            key_parts.append(event['date'])
        if 'time' in event:
            key_parts.append(event['time'])
        if 'event_id' in event:
            key_parts.append(event['event_id'])
        elif 'position' in event:
            # Use position range to avoid exact match issues
            key_parts.append(f"pos_{event['position'] // 100}")
        
        key = '-'.join(key_parts) if key_parts else str(event.get('position', 0))
        
        if key not in seen:
            seen.add(key)
            unique.append(event)
    
    return unique

def main():
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    
    print("=" * 80)
    print("STEP 1B: ADVANCED EVENT EXTRACTION FROM VERBIER.TXT")
    print("=" * 80)
    
    # Extract events
    events = extract_events_advanced(file_path)
    
    # Deduplicate
    unique_events = deduplicate_events(events)
    
    # Analyze by type
    by_type = {}
    for event in unique_events:
        event_type = event['type']
        if event_type not in by_type:
            by_type[event_type] = []
        by_type[event_type].append(event)
    
    print(f"\n📊 EXTRACTION RESULTS:")
    print(f"  • Total events found: {len(unique_events)}")
    print(f"  • Events with metadata: {sum(1 for e in unique_events if e.get('has_metadata'))}")
    
    print(f"\n📈 BY EXTRACTION TYPE:")
    for event_type, events_list in by_type.items():
        print(f"  • {event_type}: {len(events_list)} events")
    
    print(f"\n🎯 CONFIRMED EVENTS (with URLs):")
    confirmed = [e for e in unique_events if e.get('has_metadata')]
    for event in confirmed[:5]:
        print(f"  • {event.get('date', 'N/A')} {event.get('time', '')} - ID: {event.get('event_id', 'N/A')}")
    
    print(f"\n🔍 EXTRACTED EVENTS (without URLs):")
    extracted = [e for e in unique_events if not e.get('has_metadata')]
    for event in extracted[:10]:
        if 'date' in event:
            print(f"  • {event.get('date', 'N/A')} {event.get('time', 'N/A')} - Type: {event['type']}")
            if 'venue' in event:
                print(f"    Venue: {event['venue']}")
    
    # Save results
    output_path = '/Users/zitrono/dev/tmp/verbier/all_events_extracted.json'
    with open(output_path, 'w') as f:
        json.dump(unique_events, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(unique_events)} events to {output_path}")
    
    # Summary
    print(f"\n📋 SUMMARY:")
    print(f"  • Events with existing metadata: {len(confirmed)}")
    print(f"  • Events needing metadata: {len(extracted)}")
    print(f"  • Total coverage: {len(unique_events)} events")
    print("=" * 80)

if __name__ == "__main__":
    main()