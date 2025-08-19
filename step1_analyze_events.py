#!/usr/bin/env python3
"""
Step 1: Analyze and extract all events from verbier.txt
This script identifies all events in the file, not just those with metadata
"""

import re
from datetime import datetime
import json

def extract_all_events(file_path):
    """Extract all events from verbier.txt using various patterns"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    events = []
    
    # Pattern 1: Events with times (e.g., "17 juillet, 19h30")
    date_time_pattern = r'(\d{1,2}\s+(?:juillet|July))[,\s]+(\d{1,2}h\d{0,2})'
    
    # Pattern 2: Artist names in capitals followed by instrument/role
    artist_pattern = r'^([A-Z][A-Z\s\-\']{2,40})\s+(?:piano|violin|cello|conductor|soprano|tenor|baritone|mezzo|orchestra|quartet|trio)'
    
    # Pattern 3: Concert titles
    concert_titles = [
        'OPENING CONCERT', 'CLOSING CONCERT', 'GALA CONCERT',
        'CHAMBER MUSIC', 'MASTERCLASS', 'ACADEMY PRESENTS',
        'RENCONTRES', 'RÉCITAL', 'CONCERT'
    ]
    
    # Pattern 4: Look for structured event blocks
    # Events often appear with date, time, venue, and performers
    
    lines = content.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Check for date patterns
        date_match = re.search(r'(\d{1,2})\s+(juillet|July)', line, re.IGNORECASE)
        if date_match:
            # Found a date, look for time and details in nearby lines
            event_info = {
                'date': date_match.group(0),
                'line_number': i + 1,
                'raw_text': []
            }
            
            # Look for time
            time_match = re.search(r'(\d{1,2}h\d{0,2})', line)
            if time_match:
                event_info['time'] = time_match.group(1)
            
            # Collect next few lines for context
            for j in range(5):
                if i + j < len(lines):
                    event_info['raw_text'].append(lines[i + j])
            
            # Extract title/artists from context
            context = '\n'.join(event_info['raw_text'])
            
            # Look for venue
            venues = ['Salle des Combins', 'Église', 'Victoria Hall', 'Medran', 'Cinéma']
            for venue in venues:
                if venue in context:
                    event_info['venue'] = venue
                    break
            
            # Look for artists (all caps names)
            artists = re.findall(r'\b([A-Z][A-Z\s]{2,30})\b', context)
            if artists:
                event_info['artists'] = [a.strip() for a in artists if len(a.strip()) > 3]
            
            events.append(event_info)
        
        i += 1
    
    # Deduplicate and clean
    unique_events = []
    seen = set()
    
    for event in events:
        # Create a simple hash for deduplication
        key = f"{event.get('date', '')}-{event.get('time', '')}"
        if key not in seen and event.get('date'):
            seen.add(key)
            unique_events.append(event)
    
    return unique_events

def analyze_event_patterns(events):
    """Analyze patterns in extracted events"""
    
    stats = {
        'total_events': len(events),
        'events_with_time': sum(1 for e in events if 'time' in e),
        'events_with_venue': sum(1 for e in events if 'venue' in e),
        'events_with_artists': sum(1 for e in events if 'artists' in e),
        'date_distribution': {}
    }
    
    for event in events:
        date = event.get('date', 'unknown')
        if date not in stats['date_distribution']:
            stats['date_distribution'][date] = 0
        stats['date_distribution'][date] += 1
    
    return stats

def save_events_json(events, output_path):
    """Save extracted events to JSON for next step"""
    
    # Clean up for JSON serialization
    clean_events = []
    for event in events:
        clean_event = {
            'date': event.get('date', ''),
            'time': event.get('time', ''),
            'venue': event.get('venue', ''),
            'artists': event.get('artists', []),
            'line_number': event.get('line_number', 0),
            'context': ' '.join(event.get('raw_text', [])[:3])
        }
        clean_events.append(clean_event)
    
    with open(output_path, 'w') as f:
        json.dump(clean_events, f, indent=2, ensure_ascii=False)

def main():
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    
    print("=" * 80)
    print("STEP 1: ANALYZING ALL EVENTS IN VERBIER.TXT")
    print("=" * 80)
    
    # Extract all events
    events = extract_all_events(file_path)
    
    # Analyze patterns
    stats = analyze_event_patterns(events)
    
    print(f"\n📊 EVENT EXTRACTION RESULTS:")
    print(f"  • Total events found: {stats['total_events']}")
    print(f"  • Events with time: {stats['events_with_time']}")
    print(f"  • Events with venue: {stats['events_with_venue']}")
    print(f"  • Events with artists: {stats['events_with_artists']}")
    
    print(f"\n📅 DATE DISTRIBUTION:")
    dates_sorted = sorted(stats['date_distribution'].items(), 
                          key=lambda x: int(re.search(r'\d+', x[0]).group()) if re.search(r'\d+', x[0]) else 0)
    for date, count in dates_sorted[:10]:
        print(f"  • {date}: {count} events")
    
    print(f"\n📝 SAMPLE EVENTS:")
    for event in events[:5]:
        print(f"\n  Event at line {event['line_number']}:")
        print(f"    Date: {event.get('date', 'N/A')}")
        print(f"    Time: {event.get('time', 'N/A')}")
        print(f"    Venue: {event.get('venue', 'N/A')}")
        if event.get('artists'):
            print(f"    Artists: {', '.join(event['artists'][:3])}")
    
    # Save to JSON for next step
    output_path = '/Users/zitrono/dev/tmp/verbier/extracted_events.json'
    save_events_json(events, output_path)
    
    print(f"\n✅ Saved {len(events)} events to {output_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()