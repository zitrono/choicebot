#!/usr/bin/env python3
"""
Script to add event and booking URLs to verbier.txt file
Matches events based on dates and times from tickets.txt
"""

import re
from datetime import datetime
from typing import Dict, List, Tuple, Optional

def parse_tickets_file(filepath: str) -> List[Dict[str, str]]:
    """Parse tickets.txt to extract event URLs and booking URLs."""
    events = []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_event = {}
    for line in lines:
        line = line.strip()
        if line.startswith('Event Page:'):
            current_event['event_url'] = line.replace('Event Page: ', '')
            # Extract date and time from URL if present
            match = re.search(r'vf25-(\d{2})-(\d{2})-(\d{4})', current_event['event_url'])
            if match:
                month = match.group(1)
                day = match.group(2)
                time = match.group(3)
                current_event['date'] = f"{day}.{month}"
                current_event['time'] = f"{time[:2]}:{time[2:]}"
        elif line.startswith('Ticketing:'):
            current_event['booking_url'] = line.replace('Ticketing: ', '')
            if current_event:
                events.append(current_event.copy())
                current_event = {}
    
    return events

def parse_verbier_file(filepath: str) -> List[str]:
    """Read verbier.txt file and return lines."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.readlines()

def find_event_boundaries(lines: List[str]) -> List[Tuple[int, int, str, str]]:
    """Find event boundaries in verbier.txt based on date and time patterns."""
    events = []
    date_pattern = r'^(Lu\.|Ma\.|Me\.|Je\.|Ve\.|Sa\.|Di\.)\s+(\d{1,2})'
    time_pattern = r'^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})'
    
    current_date = None
    current_time = None
    event_start = None
    
    for i, line in enumerate(lines):
        # Check for date
        date_match = re.match(date_pattern, line)
        if date_match:
            # Map French day abbreviations to dates
            day_num = date_match.group(2)
            current_date = day_num
            continue
        
        # Check for time
        time_match = re.match(time_pattern, line)
        if time_match:
            if event_start is not None and current_date and current_time:
                # Save previous event
                events.append((event_start, i-1, current_date, current_time))
            
            current_time = time_match.group(1)
            event_start = i
    
    # Add last event if exists
    if event_start is not None and current_date and current_time:
        events.append((event_start, len(lines)-1, current_date, current_time))
    
    return events

def match_event_to_urls(date: str, time: str, ticket_events: List[Dict[str, str]]) -> Optional[Dict[str, str]]:
    """Match an event from verbier.txt to URLs from tickets.txt."""
    # Normalize time format
    time_normalized = time.replace(':', '')
    
    # Try to match by date and time
    for event in ticket_events:
        if 'date' in event and 'time' in event:
            # Check if date matches (day only, as month mapping is complex)
            event_day = event['date'].split('.')[0]
            if date.strip() == event_day:
                # Check if time matches (approximate match)
                event_time = event['time'].replace(':', '')
                if abs(int(time_normalized[:2]) - int(event_time[:2])) <= 1:  # Within 1 hour
                    return event
    
    return None

def add_links_to_verbier(verbier_path: str, tickets_path: str, output_path: str):
    """Main function to add links to verbier.txt."""
    print("Parsing tickets file...")
    ticket_events = parse_tickets_file(tickets_path)
    print(f"Found {len(ticket_events)} events with URLs")
    
    print("Reading verbier file...")
    lines = parse_verbier_file(verbier_path)
    print(f"Read {len(lines)} lines")
    
    print("Finding event boundaries...")
    events = find_event_boundaries(lines)
    print(f"Found {len(events)} events in verbier.txt")
    
    # Create modified content
    modified_lines = lines.copy()
    offset = 0  # Track line offset due to insertions
    matched_count = 0
    
    for event_start, event_end, date, time in events:
        # Try to match this event
        matched_urls = match_event_to_urls(date, time, ticket_events)
        
        if matched_urls:
            matched_count += 1
            # Find the best insertion point (after the event content, before next event)
            insert_point = event_end + 1 + offset
            
            # Create metadata block
            metadata = [
                "\n[EVENT_METADATA]\n",
                f"Event_URL: {matched_urls.get('event_url', 'Not found')}\n",
                f"Booking_URL: {matched_urls.get('booking_url', 'Not found')}\n",
                "[/EVENT_METADATA]\n"
            ]
            
            # Insert metadata
            for i, line in enumerate(metadata):
                modified_lines.insert(insert_point + i, line)
            
            offset += len(metadata)
    
    print(f"Matched {matched_count} events with URLs")
    
    # Write output
    print(f"Writing output to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(modified_lines)
    
    print("Done!")
    return matched_count

if __name__ == "__main__":
    verbier_file = "/Users/zitrono/dev/tmp/verbier/verbier.txt"
    tickets_file = "/Users/zitrono/dev/tmp/verbier/tickets.txt"
    output_file = "/Users/zitrono/dev/tmp/verbier/verbier_with_links.txt"
    
    matches = add_links_to_verbier(verbier_file, tickets_file, output_file)
    print(f"\nSuccessfully added links to {matches} events")
    print(f"Output saved to: {output_file}")