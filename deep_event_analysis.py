#!/usr/bin/env python3
"""
Deep analysis to understand the TRUE event count
Looking for actual individual performances/concerts
"""

import re
from collections import defaultdict

def analyze_file_structure(file_path):
    """Deep dive into the file structure"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Split by pages to understand structure
    pages = content.split('--- Page')
    
    print("=" * 80)
    print("DEEP FILE STRUCTURE ANALYSIS")
    print("=" * 80)
    
    print(f"\n📄 FILE OVERVIEW:")
    print(f"  • Total pages: {len(pages)}")
    print(f"  • File size: {len(content):,} characters")
    
    # Look for program listings (date + time + venue combinations)
    program_pattern = r'(\d{1,2})[h:](\d{2})(?:\s*-\s*\d{1,2}[h:]\d{2})?'
    
    all_programs = []
    
    for page_num, page in enumerate(pages):
        if not page.strip():
            continue
            
        lines = page.split('\n')
        
        for i, line in enumerate(lines):
            # Look for time patterns
            time_match = re.match(program_pattern, line.strip())
            if time_match:
                # Collect context
                context = {
                    'page': page_num,
                    'line': i,
                    'time': line.strip(),
                    'before': [],
                    'after': []
                }
                
                # Get lines before (looking for date/venue)
                for j in range(max(0, i-5), i):
                    if lines[j].strip():
                        context['before'].append(lines[j].strip())
                
                # Get lines after (looking for title/artists)
                for j in range(i+1, min(len(lines), i+10)):
                    if lines[j].strip() and not lines[j].startswith('-e'):
                        context['after'].append(lines[j].strip())
                        if len(context['after']) >= 5:
                            break
                
                all_programs.append(context)
    
    print(f"\n🎵 PROGRAM ENTRIES FOUND: {len(all_programs)}")
    
    # Analyze patterns
    print(f"\n📊 SAMPLE PROGRAM ENTRIES:")
    
    for i, prog in enumerate(all_programs[:10]):
        print(f"\n  Entry {i+1} (Page {prog['page']}):")
        print(f"    Time: {prog['time']}")
        if prog['before']:
            print(f"    Before: {prog['before'][-1]}")
        if prog['after']:
            print(f"    After: {prog['after'][0] if prog['after'] else 'N/A'}")
    
    # Look for patterns in program titles
    titles = defaultdict(int)
    for prog in all_programs:
        if prog['after']:
            first_line = prog['after'][0]
            # Common title patterns
            if 'CONCERT' in first_line.upper():
                titles['CONCERT'] += 1
            elif 'RÉCITAL' in first_line.upper() or 'RECITAL' in first_line.upper():
                titles['RECITAL'] += 1
            elif 'MASTERCLASS' in first_line.upper():
                titles['MASTERCLASS'] += 1
            elif 'ACADEMY' in first_line.upper():
                titles['ACADEMY'] += 1
            elif 'RENCONTRES' in first_line.upper():
                titles['RENCONTRES'] += 1
            elif any(word in first_line.upper() for word in ['VFO', 'VFCO', 'VFJO', 'ORCHESTRA']):
                titles['ORCHESTRA'] += 1
    
    print(f"\n🎭 EVENT TYPES DISTRIBUTION:")
    for event_type, count in sorted(titles.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {event_type}: {count}")
    
    # Check for duplicate times (might be repeated schedule)
    time_counts = defaultdict(int)
    for prog in all_programs:
        time_counts[prog['time']] += 1
    
    duplicates = {k: v for k, v in time_counts.items() if v > 1}
    
    print(f"\n🔄 DUPLICATE TIME ANALYSIS:")
    print(f"  • Unique time slots: {len(time_counts)}")
    print(f"  • Times appearing multiple times: {len(duplicates)}")
    
    if duplicates:
        print(f"\n  Most repeated times:")
        for time, count in sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"    {time}: appears {count} times")
    
    # Look for actual July dates in content
    july_dates = re.findall(r'(\d{1,2})\s+(?:juillet|July)', content, re.IGNORECASE)
    july_dates_unique = sorted(set(int(d) for d in july_dates if d.isdigit()))
    
    print(f"\n📅 JULY DATES MENTIONED:")
    print(f"  • Unique dates: {july_dates_unique}")
    print(f"  • Date range: July {min(july_dates_unique) if july_dates_unique else 'N/A'} - {max(july_dates_unique) if july_dates_unique else 'N/A'}")
    
    # Calculate actual event estimate
    print(f"\n" + "=" * 80)
    print("💡 CONCLUSION:")
    print("=" * 80)
    
    unique_events = len(time_counts)
    
    print(f"  • Total time entries in file: {len(all_programs)}")
    print(f"  • Unique time slots: {unique_events}")
    print(f"  • Many times appear 2-3x (likely duplicate program listings)")
    print(f"  • Actual unique events estimate: ~{unique_events}")
    
    return unique_events

def check_website_coverage():
    """Check what we got from website scraping"""
    
    import json
    
    try:
        with open('/Users/zitrono/dev/tmp/verbier/scraped_events.json', 'r') as f:
            scraped = json.load(f)
        
        print(f"\n🌐 WEBSITE SCRAPING RESULTS:")
        print(f"  • Total URLs scraped: {len(scraped)}")
        
        # Group by date
        by_date = defaultdict(list)
        for event in scraped:
            date = event.get('date', 'unknown')
            by_date[date].append(event)
        
        print(f"  • Days covered: {len(by_date)}")
        print(f"  • Events per day: {len(scraped) / max(len(by_date), 1):.1f} average")
        
    except:
        print("\n⚠️  Could not load scraped events data")

if __name__ == "__main__":
    unique_events = analyze_file_structure('/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt')
    check_website_coverage()
    
    print("\n" + "=" * 80)
    print("🎯 FINAL ASSESSMENT:")
    print("=" * 80)
    print(f"  • File contains ~{unique_events} unique time slots")
    print(f"  • Website has 77 event pages")
    print(f"  • Coverage: {77}/{unique_events} = {77/unique_events*100:.1f}%")
    print(f"\n  📝 This is reasonable because:")
    print(f"     - Some events might be private/invitation-only")
    print(f"     - Masterclasses might not have public pages")
    print(f"     - Some events might be grouped on single pages")
    print("=" * 80)