#!/usr/bin/env python3
"""
Script to identify unmatched events in verbier_with_links.txt
and prepare them for Gemini to search on the website
"""

import re
from typing import List, Dict, Tuple

def find_unmatched_events(filepath: str) -> List[Dict[str, any]]:
    """Find events that don't have EVENT_METADATA blocks."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    unmatched = []
    current_event = {}
    in_event = False
    event_lines = []
    
    # Patterns to identify events
    date_pattern = r'^(Lu\.|Ma\.|Me\.|Je\.|Ve\.|Sa\.|Di\.)\s+(\d{1,2})'
    month_date_pattern = r'^(Lu\.|Ma\.|Me\.|Je\.|Ve\.|Sa\.|Di\.)\s+(\d{1,2})\.(\d{2})'
    time_pattern = r'^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})'
    venue_pattern = r'^(SALLE DES COMBINS|EGLISE|ÉGLISE|CHAPITEAU|STUDIO)'
    
    current_date = None
    current_month = "07"  # Default to July
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check for month/date pattern first
        month_match = re.match(month_date_pattern, line)
        if month_match:
            current_date = f"{month_match.group(2)}.{month_match.group(3)}"
            current_month = month_match.group(3)
            i += 1
            continue
            
        # Check for date pattern
        date_match = re.match(date_pattern, line)
        if date_match:
            day = month_match.group(2) if month_match else date_match.group(2)
            current_date = f"{day}.{current_month}"
            i += 1
            continue
        
        # Check for venue
        venue_match = re.match(venue_pattern, line)
        if venue_match and current_event:
            current_event['venue'] = venue_match.group(1)
        
        # Check for time (start of event)
        time_match = re.match(time_pattern, line)
        if time_match:
            # Save previous event if exists and is unmatched
            if current_event and event_lines:
                # Check if next few lines contain EVENT_METADATA
                has_metadata = False
                for j in range(i, min(i + 50, len(lines))):
                    if '[EVENT_METADATA]' in lines[j]:
                        has_metadata = True
                        break
                    if re.match(time_pattern, lines[j]) and j != i:
                        break
                
                if not has_metadata:
                    current_event['content'] = ''.join(event_lines)
                    unmatched.append(current_event.copy())
            
            # Start new event
            current_event = {
                'date': current_date,
                'time': time_match.group(1),
                'end_time': time_match.group(2),
                'line_number': i + 1
            }
            event_lines = [line]
            in_event = True
        elif in_event:
            # Continue collecting event content
            event_lines.append(line)
            
            # Stop if we hit metadata or another time slot
            if '[EVENT_METADATA]' in line:
                in_event = False
                event_lines = []
                current_event = {}
        
        i += 1
    
    # Check last event
    if current_event and event_lines:
        current_event['content'] = ''.join(event_lines)
        unmatched.append(current_event)
    
    return unmatched

def extract_event_info(event: Dict) -> str:
    """Extract key information from event for searching."""
    content = event.get('content', '')
    
    # Extract performers/artists
    performers = []
    for line in content.split('\n'):
        line = line.strip()
        # Look for lines that likely contain performer names
        if line and not line.startswith('(') and not line.startswith('-'):
            # Check if it looks like a name or ensemble
            if any(word in line.lower() for word in ['orchestra', 'ensemble', 'quartet', 'trio', 'duo']) or \
               (len(line.split()) <= 4 and line[0].isupper()):
                performers.append(line)
    
    # Get first few lines as title/description
    lines = [l.strip() for l in content.split('\n') if l.strip()][:5]
    
    info = f"Date: {event.get('date', 'Unknown')}, "
    info += f"Time: {event.get('time', '')}-{event.get('end_time', '')}, "
    if event.get('venue'):
        info += f"Venue: {event['venue']}, "
    if performers:
        info += f"Performers: {', '.join(performers[:3])}, "
    info += f"Content: {' / '.join(lines[:3])}"
    
    return info

def main():
    print("Finding unmatched events in verbier_with_links.txt...")
    unmatched = find_unmatched_events('/Users/zitrono/dev/tmp/verbier/verbier_with_links.txt')
    
    print(f"\nFound {len(unmatched)} unmatched events")
    
    # Group by date for better analysis
    by_date = {}
    for event in unmatched:
        date = event.get('date', 'Unknown')
        if date not in by_date:
            by_date[date] = []
        by_date[date].append(event)
    
    print(f"\nUnmatched events by date:")
    for date in sorted(by_date.keys()):
        print(f"  {date}: {len(by_date[date])} events")
    
    # Save first 10 unmatched events for Gemini to search
    print("\nFirst 10 unmatched events to search:")
    search_batch = []
    for event in unmatched[:10]:
        info = extract_event_info(event)
        search_batch.append(info)
        print(f"  - {info[:100]}...")
    
    # Save to file for Gemini processing
    with open('/Users/zitrono/dev/tmp/verbier/unmatched_events.txt', 'w', encoding='utf-8') as f:
        f.write("UNMATCHED EVENTS TO SEARCH ON VERBIER FESTIVAL WEBSITE:\n")
        f.write("=" * 60 + "\n\n")
        for i, event in enumerate(unmatched[:20], 1):
            f.write(f"Event {i}:\n")
            f.write(f"  Date: {event.get('date', 'Unknown')}\n")
            f.write(f"  Time: {event.get('time', '')}-{event.get('end_time', '')}\n")
            f.write(f"  Line in file: {event.get('line_number', 'Unknown')}\n")
            if event.get('venue'):
                f.write(f"  Venue: {event['venue']}\n")
            f.write(f"  Content preview:\n")
            # Get first 10 lines of content
            content_lines = event.get('content', '').split('\n')[:10]
            for line in content_lines:
                if line.strip():
                    f.write(f"    {line.rstrip()}\n")
            f.write("\n" + "-" * 40 + "\n\n")
    
    print(f"\nSaved first 20 unmatched events to unmatched_events.txt for Gemini processing")
    return unmatched

if __name__ == "__main__":
    unmatched = main()