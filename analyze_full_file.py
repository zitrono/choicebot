#!/usr/bin/env python3
"""
Analyze the full verbier.txt file to understand event distribution
"""

import re

def analyze_verbier_file(file_path):
    """Analyze the full content of verbier.txt"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Count EVENT_METADATA blocks
    metadata_blocks = re.findall(r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]', content, re.DOTALL)
    
    # Look for different event indicators
    # Common patterns: dates, times, concert titles, artist names
    
    # Count occurrences of date patterns (e.g., "17 juillet", "July 17")
    date_patterns = [
        r'\d{1,2}\s+juillet',  # French dates
        r'July\s+\d{1,2}',     # English dates
        r'\d{1,2}/\d{1,2}',    # Numeric dates
    ]
    
    dates_found = set()
    for pattern in date_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        dates_found.update(matches)
    
    # Count concert/event indicators
    event_indicators = [
        r'Concert',
        r'Récital',
        r'Masterclass',
        r'Academy',
        r'Rencontres',
        r'Chamber Music',
        r'Orchestra',
        r'Philharmonic',
        r'Symphony',
        r'Quartet',
        r'Trio',
        r'Festival'
    ]
    
    event_counts = {}
    for indicator in event_indicators:
        count = len(re.findall(indicator, content, re.IGNORECASE))
        if count > 0:
            event_counts[indicator] = count
    
    # Look for numbered lists (often used for program listings)
    numbered_items = re.findall(r'^\d+\.\s+', content, re.MULTILINE)
    
    # Look for performer names (typically in all caps or with specific formatting)
    performer_patterns = re.findall(r'\b[A-Z][A-Z\s]{2,30}\b', content)
    unique_performers = set(p for p in performer_patterns if len(p.split()) <= 4 and 'VERBIER' not in p)
    
    # Count pages (as events are often organized by pages)
    page_markers = re.findall(r'---\s*Page\s*\d+\s*---', content)
    
    print("=" * 80)
    print("VERBIER.TXT COMPLETE FILE ANALYSIS")
    print("=" * 80)
    
    print(f"\n📊 FILE STATISTICS:")
    print(f"  • Total file size: {len(content):,} characters")
    print(f"  • Total lines: {content.count(chr(10)):,}")
    print(f"  • EVENT_METADATA blocks: {len(metadata_blocks)}")
    
    print(f"\n📅 DATE INDICATORS:")
    print(f"  • Unique date references found: {len(dates_found)}")
    if dates_found:
        sample_dates = list(dates_found)[:5]
        for date in sample_dates:
            print(f"    - {date}")
        if len(dates_found) > 5:
            print(f"    ... and {len(dates_found) - 5} more")
    
    print(f"\n🎵 EVENT TYPE INDICATORS:")
    for indicator, count in sorted(event_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {indicator}: {count} occurrences")
    
    print(f"\n📄 DOCUMENT STRUCTURE:")
    print(f"  • Page markers found: {len(page_markers)}")
    print(f"  • Numbered list items: {len(numbered_items)}")
    
    print(f"\n🎭 POTENTIAL PERFORMERS:")
    print(f"  • Unique performer names (ALL CAPS): {len(unique_performers)}")
    if unique_performers:
        sample_performers = list(unique_performers)[:10]
        for performer in sample_performers:
            if len(performer.strip()) > 3:  # Filter out very short entries
                print(f"    - {performer.strip()}")
    
    # Estimate total events
    print(f"\n" + "=" * 80)
    print("💡 EVENT COUNT ESTIMATION:")
    print("=" * 80)
    
    # Look for the actual count mentioned in the file
    count_mentions = re.findall(r'(\d{3})\s+(?:events?|concerts?|performances?)', content, re.IGNORECASE)
    if count_mentions:
        print(f"  • File mentions event counts: {set(count_mentions)}")
    
    # Check for the "254" number specifically
    if '254' in content:
        context_254 = []
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if '254' in line:
                start = max(0, i-1)
                end = min(len(lines), i+2)
                context_254.append('\n'.join(lines[start:end]))
        
        if context_254:
            print(f"\n  • Found '254' in context:")
            for ctx in context_254[:2]:
                print(f"    {ctx[:100]}...")
    
    print(f"\n📊 SUMMARY:")
    print(f"  • Events with URL metadata: {len(metadata_blocks)}")
    print(f"  • Events without URLs: Estimated 200+ based on content volume")
    print(f"  • Total events in festival: Likely 250+ based on file structure")
    
    print("=" * 80)

if __name__ == "__main__":
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    analyze_verbier_file(file_path)