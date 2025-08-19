#!/usr/bin/env python3
"""
Step 1 (Final): Extract all events from verbier.txt using the actual file structure
Events are structured as:
- Date line (e.g., "Je. 17.07")
- Venue line (e.g., "EGLISE")
- Time line (e.g., "11:00-13:00")
- Event details
- [EVENT_METADATA] block (optional)
"""

import re
import json
from collections import defaultdict

def parse_verbier_file(file_path):
    """Parse the verbier.txt file and extract all events"""
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    events = []
    i = 0
    
    # Date patterns
    date_patterns = [
        r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.\s+(\d{2})\.(\d{2})$',  # French: Lu. 17.07
        r'^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.\s+(\d{2})\.(\d{2})$',  # English
        r'^(\d{1,2})\s+(juillet|July)$',  # Alternative format
    ]
    
    # Venue keywords
    venues = [
        'EGLISE', 'ÉGLISE', 'SALLE DES COMBINS', 'VICTORIA HALL', 
        'MEDRAN', 'CINÉMA', 'JARDIN', 'PLACE DU VILLAGE',
        'CHALET', 'STUDIO', 'CENTRE', 'TENTE'
    ]
    
    # Time pattern
    time_pattern = r'^(\d{1,2}:\d{2})(?:-(\d{1,2}:\d{2}))?$'
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Check if this looks like a date line
        date_match = None
        for pattern in date_patterns:
            date_match = re.match(pattern, line)
            if date_match:
                break
        
        if date_match:
            event = {
                'line_number': i + 1,
                'raw_date': line,
                'has_metadata': False
            }
            
            # Parse date
            if '.' in line:  # Format: Je. 17.07
                parts = line.split('.')
                if len(parts) >= 3:
                    day_name = parts[0].strip()
                    day = parts[1].strip()
                    month = parts[2].strip()
                    event['date'] = f"{day}.{month}"
                    event['day_name'] = day_name
            
            # Look for venue on next lines
            venue_found = False
            j = i + 1
            while j < min(i + 5, len(lines)):
                next_line = lines[j].strip()
                
                # Skip page markers
                if '--- Page' in next_line:
                    j += 1
                    continue
                
                # Check for venue
                for venue in venues:
                    if venue in next_line.upper():
                        event['venue'] = next_line
                        venue_found = True
                        break
                
                if venue_found:
                    break
                j += 1
            
            # Look for EVENT_METADATA
            k = i
            while k < min(i + 30, len(lines)):
                if '[EVENT_METADATA]' in lines[k]:
                    # Found metadata block
                    metadata_start = k
                    metadata_end = k
                    
                    # Find end of metadata
                    while metadata_end < len(lines):
                        if '[/EVENT_METADATA]' in lines[metadata_end]:
                            break
                        metadata_end += 1
                    
                    # Extract URLs from metadata
                    metadata_text = ''.join(lines[metadata_start:metadata_end+1])
                    
                    event_url_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', metadata_text)
                    booking_url_match = re.search(r'Booking_URL:\s*(https?://[^\s\n]+)', metadata_text)
                    
                    if event_url_match:
                        event['event_url'] = event_url_match.group(1).strip()
                        event['has_metadata'] = True
                        
                        # Extract event ID from URL
                        event_id = event['event_url'].split('/')[-1].rstrip('/')
                        event['event_id'] = event_id
                    
                    if booking_url_match:
                        event['booking_url'] = booking_url_match.group(1).strip()
                    
                    break
                    
                k += 1
            
            # Look for time on nearby lines
            for m in range(max(0, i-2), min(i+10, len(lines))):
                time_match = re.match(time_pattern, lines[m].strip())
                if time_match:
                    event['time'] = lines[m].strip()
                    break
            
            # Look for title/artists in next few lines
            title_lines = []
            for n in range(i+1, min(i+15, len(lines))):
                line_text = lines[n].strip()
                
                # Stop at next date or metadata
                if re.match(r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.', line_text):
                    break
                if '[EVENT_METADATA]' in line_text:
                    break
                if '--- Page' in line_text:
                    continue
                    
                # Collect potential title/artist lines
                if line_text and not line_text.startswith('-e'):
                    # Check if it's a title (usually in CAPS or contains specific keywords)
                    if (line_text.isupper() or 
                        'CONCERT' in line_text.upper() or 
                        'RÉCITAL' in line_text.upper() or
                        'MASTERCLASS' in line_text.upper()):
                        if 'title' not in event:
                            event['title'] = line_text
                    title_lines.append(line_text)
            
            event['context'] = '\n'.join(title_lines[:5])
            
            events.append(event)
        
        i += 1
    
    return events

def analyze_events(events):
    """Analyze extracted events"""
    
    stats = {
        'total': len(events),
        'with_metadata': sum(1 for e in events if e.get('has_metadata')),
        'with_venue': sum(1 for e in events if 'venue' in e),
        'with_time': sum(1 for e in events if 'time' in e),
        'with_title': sum(1 for e in events if 'title' in e),
    }
    
    # Group by date
    by_date = defaultdict(list)
    for event in events:
        date = event.get('date', 'unknown')
        by_date[date].append(event)
    
    return stats, by_date

def main():
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    
    print("=" * 80)
    print("STEP 1: COMPREHENSIVE EVENT EXTRACTION FROM VERBIER.TXT")
    print("=" * 80)
    
    # Extract events
    events = parse_verbier_file(file_path)
    
    # Analyze
    stats, by_date = analyze_events(events)
    
    print(f"\n📊 EXTRACTION RESULTS:")
    print(f"  • Total events found: {stats['total']}")
    print(f"  • Events with metadata: {stats['with_metadata']}")
    print(f"  • Events with venue: {stats['with_venue']}")
    print(f"  • Events with time: {stats['with_time']}")
    print(f"  • Events with title: {stats['with_title']}")
    
    print(f"\n📅 EVENTS BY DATE:")
    dates_sorted = sorted(by_date.keys())
    for date in dates_sorted[:10]:
        count = len(by_date[date])
        print(f"  • {date}: {count} events")
    if len(dates_sorted) > 10:
        print(f"  ... and {len(dates_sorted) - 10} more dates")
    
    print(f"\n🎯 EVENTS WITH EXISTING METADATA:")
    with_metadata = [e for e in events if e.get('has_metadata')]
    for event in with_metadata[:5]:
        print(f"  • {event.get('date', 'N/A')} {event.get('time', 'N/A')}")
        print(f"    ID: {event.get('event_id', 'N/A')}")
        if 'title' in event:
            print(f"    Title: {event['title']}")
    
    print(f"\n❌ EVENTS WITHOUT METADATA (need URLs):")
    without_metadata = [e for e in events if not e.get('has_metadata')]
    for event in without_metadata[:10]:
        print(f"  • {event.get('date', 'N/A')} {event.get('time', 'N/A')}")
        if 'venue' in event:
            print(f"    Venue: {event['venue']}")
        if 'title' in event:
            print(f"    Title: {event['title'][:50]}...")
    
    # Save to JSON
    output_path = '/Users/zitrono/dev/tmp/verbier/extracted_events.json'
    with open(output_path, 'w') as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(events)} events to {output_path}")
    
    print(f"\n📈 NEXT STEPS:")
    print(f"  1. ✅ Extracted {len(events)} total events from verbier.txt")
    print(f"  2. → Need to scrape Verbier Festival website for all event URLs")
    print(f"  3. → Match {len(without_metadata)} events without metadata to website URLs")
    print(f"  4. → Generate EVENT_METADATA blocks for all events")
    print("=" * 80)

if __name__ == "__main__":
    main()