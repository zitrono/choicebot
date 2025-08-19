#!/usr/bin/env python3
"""
Enhanced script to add event and booking URLs to verbier.txt file
Includes better date matching for July 31 and August events
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
            
            # Also check for special URL patterns for July 31 and August
            if 'quatuor-ebene' in current_event['event_url']:
                current_event['date'] = '31.07'
                current_event['time'] = '11:00'
            elif 'academy-presents-iv' in current_event['event_url']:
                current_event['date'] = '31.07'
                current_event['time'] = '15:30'
            elif 'rencontres-inedites-viii' in current_event['event_url']:
                current_event['date'] = '31.07'
                current_event['time'] = '19:30'
            elif 'brad-mehldau' in current_event['event_url']:
                current_event['date'] = '31.07'
                current_event['time'] = '18:30'
            elif 'academy-presents-v' in current_event['event_url']:
                current_event['date'] = '01.08'
                current_event['time'] = '11:00'
            elif 'lozakovich-moreau' in current_event['event_url']:
                current_event['date'] = '01.08'
                current_event['time'] = '19:30'
            elif 'vfco-currentzis' in current_event['event_url']:
                current_event['date'] = '01.08'
                current_event['time'] = '18:30'
            elif 'vfjo-kochanovsky' in current_event['event_url']:
                current_event['date'] = '02.08'
                current_event['time'] = '11:00'
            elif 'vfo-jarvi-buniatishvili' in current_event['event_url']:
                current_event['date'] = '02.08'
                current_event['time'] = '19:30'
            elif 'talk-with-paavo' in current_event['event_url']:
                current_event['date'] = '03.08'
                current_event['time'] = '11:00'
            elif 'closing-concert' in current_event['event_url']:
                current_event['date'] = '03.08'
                current_event['time'] = '19:30'
                
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

def find_event_boundaries(lines: List[str]) -> List[Tuple[int, int, str, str, str]]:
    """Find event boundaries in verbier.txt based on date and time patterns."""
    events = []
    date_pattern = r'^(Lu\.|Ma\.|Me\.|Je\.|Ve\.|Sa\.|Di\.)\s+(\d{1,2})'
    month_date_pattern = r'^(Lu\.|Ma\.|Me\.|Je\.|Ve\.|Sa\.|Di\.)\s+(\d{1,2})\.(\d{2})'
    time_pattern = r'^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})'
    
    current_date = None
    current_month = "07"  # Default to July
    current_time = None
    event_start = None
    event_content = []
    
    # Map days to July dates
    july_dates = {
        '27': '27.07',
        '28': '28.07', 
        '29': '29.07',
        '30': '30.07',
        '31': '31.07',
        '1': '01.08',
        '2': '02.08',
        '3': '03.08'
    }
    
    for i, line in enumerate(lines):
        # Check for month/date pattern first
        month_match = re.match(month_date_pattern, line)
        if month_match:
            day = month_match.group(2)
            month = month_match.group(3)
            current_date = f"{day}.{month}"
            current_month = month
            continue
            
        # Check for date pattern
        date_match = re.match(date_pattern, line)
        if date_match:
            day = date_match.group(2)
            # Check if we're in late July or early August
            if day in july_dates:
                current_date = july_dates[day]
            else:
                current_date = f"{day}.{current_month}"
            continue
        
        # Check for time (start of event)
        time_match = re.match(time_pattern, line)
        if time_match:
            # Save previous event if exists
            if event_start is not None and current_date and current_time:
                event_text = ' '.join(event_content[:5])  # First 5 lines for matching
                events.append((event_start, i-1, current_date, current_time, event_text))
            
            # Start new event
            current_time = time_match.group(1)
            event_start = i
            event_content = []
        elif event_start is not None:
            # Collect event content
            if line.strip():
                event_content.append(line.strip())
    
    # Add last event if exists
    if event_start is not None and current_date and current_time:
        event_text = ' '.join(event_content[:5])
        events.append((event_start, len(lines)-1, current_date, current_time, event_text))
    
    return events

def match_event_to_urls(date: str, time: str, content: str, ticket_events: List[Dict[str, str]]) -> Optional[Dict[str, str]]:
    """Match an event from verbier.txt to URLs from tickets.txt."""
    # Normalize time format
    time_normalized = time.replace(':', '')
    
    # Try exact date and time match first
    for event in ticket_events:
        if 'date' in event and 'time' in event:
            if date == event['date'] and time == event['time']:
                return event
    
    # Try approximate time match
    for event in ticket_events:
        if 'date' in event and 'time' in event:
            if date == event['date']:
                # Check if time matches (within 1 hour)
                event_time = event['time'].replace(':', '')
                try:
                    if abs(int(time_normalized[:2]) - int(event_time[:2])) <= 1:
                        return event
                except:
                    pass
    
    # Try content matching for specific events
    content_lower = content.lower()
    for event in ticket_events:
        url = event.get('event_url', '').lower()
        if 'quatuor' in content_lower and 'ebene' in content_lower and 'quatuor-ebene' in url:
            return event
        if 'brad mehldau' in content_lower and 'brad-mehldau' in url:
            return event
        if 'lozakovich' in content_lower and 'moreau' in content_lower and 'lozakovich-moreau' in url:
            return event
        if 'currentzis' in content_lower and 'currentzis' in url:
            return event
        if 'closing' in content_lower and 'yo-yo ma' in content_lower and 'closing-concert' in url:
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
    
    for event_start, event_end, date, time, content in events:
        # Try to match this event
        matched_urls = match_event_to_urls(date, time, content, ticket_events)
        
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
    tickets_file = "/Users/zitrono/dev/tmp/verbier/tickets_complete.txt"
    output_file = "/Users/zitrono/dev/tmp/verbier/verbier_with_all_links.txt"
    
    matches = add_links_to_verbier(verbier_file, tickets_file, output_file)
    print(f"\nSuccessfully added links to {matches} events")
    print(f"Output saved to: {output_file}")