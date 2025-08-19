#!/usr/bin/env python3
"""
Validate the actual number of events in verbier.txt
Comprehensive analysis to understand the 250+ events claim vs 77 URLs found
"""

import re
from collections import defaultdict
import json

def comprehensive_event_analysis(file_path):
    """Perform a thorough analysis of all events in verbier.txt"""
    
    with open(file_path, 'r') as f:
        content = f.read()
        lines = content.split('\n')
    
    events_found = {
        'by_date_pattern': [],
        'by_time_pattern': [],
        'by_concert_keyword': [],
        'by_artist_listing': [],
        'by_metadata_blocks': [],
        'by_page_sections': []
    }
    
    # Method 1: Find all date patterns (most reliable)
    date_patterns = [
        (r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.\s+(\d{2})\.(\d{2})', 'day_format'),  # Je. 17.07
        (r'^(\d{1,2})\s+(juillet|July)', 'month_format'),  # 17 juillet
        (r'(\d{1,2})\s+(juillet|July)\s+(\d{4})', 'full_date'),  # 17 juillet 2025
    ]
    
    for i, line in enumerate(lines):
        for pattern, format_type in date_patterns:
            if re.match(pattern, line.strip(), re.IGNORECASE):
                events_found['by_date_pattern'].append({
                    'line': i + 1,
                    'text': line.strip(),
                    'format': format_type
                })
                break
    
    # Method 2: Find all time patterns (events have times)
    time_pattern = r'(\d{1,2})[h:](\d{2})(?:\s*-\s*(\d{1,2})[h:](\d{2}))?'
    for i, line in enumerate(lines):
        if re.match(time_pattern, line.strip()):
            # Check if this is near a date
            context = []
            for j in range(max(0, i-3), min(len(lines), i+3)):
                context.append(lines[j].strip())
            
            events_found['by_time_pattern'].append({
                'line': i + 1,
                'time': line.strip(),
                'context': ' | '.join(context)
            })
    
    # Method 3: Concert/Event keywords
    event_keywords = [
        'CONCERT', 'RÉCITAL', 'RECITAL', 'MASTERCLASS', 'RENCONTRES',
        'ACADEMY PRESENTS', 'ORCHESTRA', 'SYMPHONY', 'QUARTET', 'TRIO',
        'ENSEMBLE', 'GALA', 'OPENING', 'CLOSING', 'FESTIVAL'
    ]
    
    for i, line in enumerate(lines):
        for keyword in event_keywords:
            if keyword in line.upper():
                events_found['by_concert_keyword'].append({
                    'line': i + 1,
                    'keyword': keyword,
                    'text': line.strip()[:100]
                })
                break
    
    # Method 4: Artist listings (lines with multiple artist names)
    artist_pattern = r'^[A-Z][a-z]+\s+[A-Z][A-Z\s\-]+\s+(piano|violon|violin|cello|soprano|tenor|conductor|orchestra)'
    for i, line in enumerate(lines):
        if re.match(artist_pattern, line.strip()):
            events_found['by_artist_listing'].append({
                'line': i + 1,
                'text': line.strip()
            })
    
    # Method 5: Count EVENT_METADATA blocks
    metadata_blocks = re.findall(r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]', content, re.DOTALL)
    for block in metadata_blocks:
        url_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', block)
        if url_match:
            url = url_match.group(1)
            event_id = url.split('/')[-1].rstrip('/')
            events_found['by_metadata_blocks'].append(event_id)
    
    # Method 6: Analyze by page sections
    pages = content.split('--- Page')
    for page_num, page_content in enumerate(pages[1:], 1):  # Skip first empty split
        # Count events per page
        page_dates = []
        for pattern, _ in date_patterns:
            matches = re.findall(pattern, page_content, re.IGNORECASE | re.MULTILINE)
            page_dates.extend(matches)
        
        if page_dates:
            events_found['by_page_sections'].append({
                'page': page_num,
                'event_count': len(page_dates)
            })
    
    return events_found

def deduplicate_and_count(events_data):
    """Deduplicate events and get accurate count"""
    
    # Extract unique dates from date patterns
    unique_dates = set()
    for event in events_data['by_date_pattern']:
        unique_dates.add(event['text'])
    
    # Extract unique times (with deduplication by proximity)
    time_events = []
    last_line = -100
    for event in events_data['by_time_pattern']:
        if event['line'] - last_line > 5:  # Events are at least 5 lines apart
            time_events.append(event)
            last_line = event['line']
    
    return {
        'unique_dates': len(unique_dates),
        'unique_time_slots': len(time_events),
        'metadata_blocks': len(events_data['by_metadata_blocks']),
        'concert_mentions': len(events_data['by_concert_keyword']),
        'pages_with_events': len(events_data['by_page_sections'])
    }

def main():
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    
    print("=" * 80)
    print("COMPREHENSIVE EVENT COUNT VALIDATION")
    print("=" * 80)
    
    # Analyze events
    events_data = comprehensive_event_analysis(file_path)
    counts = deduplicate_and_count(events_data)
    
    print(f"\n📊 EVENT DETECTION METHODS:")
    print(f"  • Date patterns found: {len(events_data['by_date_pattern'])}")
    print(f"  • Time slots found: {len(events_data['by_time_pattern'])}")
    print(f"  • Concert keywords: {len(events_data['by_concert_keyword'])}")
    print(f"  • Artist listings: {len(events_data['by_artist_listing'])}")
    print(f"  • EVENT_METADATA blocks: {len(events_data['by_metadata_blocks'])}")
    
    print(f"\n📈 DEDUPLICATED COUNTS:")
    print(f"  • Unique date occurrences: {counts['unique_dates']}")
    print(f"  • Unique time slots: {counts['unique_time_slots']}")
    print(f"  • Pages with events: {counts['pages_with_events']}")
    
    print(f"\n🔍 SAMPLE DATE PATTERNS FOUND:")
    for event in events_data['by_date_pattern'][:10]:
        print(f"  Line {event['line']}: {event['text']} ({event['format']})")
    
    print(f"\n⏰ SAMPLE TIME SLOTS:")
    for event in events_data['by_time_pattern'][:10]:
        print(f"  Line {event['line']}: {event['time']}")
    
    # Calculate best estimate
    print(f"\n💡 ANALYSIS CONCLUSION:")
    print(f"  • Current EVENT_METADATA blocks: {counts['metadata_blocks']}")
    print(f"  • Unique date patterns in file: {counts['unique_dates']}")
    print(f"  • Time-based event count: {counts['unique_time_slots']}")
    
    # Check for multi-event days
    dates_dict = defaultdict(int)
    for event in events_data['by_time_pattern']:
        # Extract date from context if possible
        for date_event in events_data['by_date_pattern']:
            if abs(date_event['line'] - event['line']) < 10:
                dates_dict[date_event['text']] += 1
                break
    
    multi_event_days = sum(1 for count in dates_dict.values() if count > 1)
    
    print(f"\n📅 DATE ANALYSIS:")
    print(f"  • Days with multiple events: {multi_event_days}")
    print(f"  • Average events per day: {counts['unique_time_slots'] / max(counts['unique_dates'], 1):.1f}")
    
    # Final verdict
    print(f"\n" + "=" * 80)
    print("🎯 FINAL VERDICT:")
    print("=" * 80)
    
    actual_event_estimate = counts['unique_time_slots']
    
    if actual_event_estimate < 100:
        print(f"❌ The file appears to contain approximately {actual_event_estimate} distinct events,")
        print(f"   NOT 250+ as initially thought.")
        print(f"\n📝 EXPLANATION:")
        print(f"  • The '250+' might refer to total text items/sections")
        print(f"  • Many sections might be program notes, not separate events")
        print(f"  • The 77 URLs from the website seems reasonable")
    else:
        print(f"✅ The file contains approximately {actual_event_estimate} distinct events")
        print(f"   This validates the 250+ events claim")
        print(f"\n⚠️  ISSUE: Only 77 URLs found on website")
        print(f"  • Website might not list all events")
        print(f"  • Some events might be grouped on single pages")
        print(f"  • Need deeper web scraping")
    
    print("=" * 80)
    
    # Save detailed analysis
    with open('/Users/zitrono/dev/tmp/verbier/event_count_analysis.json', 'w') as f:
        json.dump({
            'counts': counts,
            'sample_dates': [e['text'] for e in events_data['by_date_pattern'][:20]],
            'sample_times': [e['time'] for e in events_data['by_time_pattern'][:20]],
            'conclusion': f"Estimated {actual_event_estimate} distinct events"
        }, f, indent=2)

if __name__ == "__main__":
    main()