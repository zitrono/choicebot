#!/usr/bin/env python3
"""
Validate all URLs in verbier.txt file
"""

import re
from collections import defaultdict
from urllib.parse import urlparse, parse_qs

def extract_urls(file_path):
    """Extract all Event_URL and Booking_URL from the file"""
    event_urls = []
    booking_urls = []
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find all EVENT_METADATA blocks
    metadata_blocks = re.findall(r'\[EVENT_METADATA\](.*?)\[/EVENT_METADATA\]', content, re.DOTALL)
    
    for block in metadata_blocks:
        # Extract Event_URL
        event_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', block)
        if event_match:
            event_urls.append(event_match.group(1).strip())
        
        # Extract Booking_URL
        booking_match = re.search(r'Booking_URL:\s*(https?://[^\s\n]+)', block)
        if booking_match:
            booking_urls.append(booking_match.group(1).strip())
    
    return event_urls, booking_urls

def validate_event_urls(urls):
    """Validate Event URLs format"""
    issues = []
    patterns = defaultdict(int)
    
    for url in urls:
        parsed = urlparse(url)
        
        # Check domain
        if parsed.netloc != 'www.verbierfestival.com':
            issues.append(f"Wrong domain: {url}")
        
        # Check path pattern
        if not parsed.path.startswith('/en/show/'):
            issues.append(f"Wrong path pattern: {url}")
        
        # Extract show ID pattern
        show_id = parsed.path.replace('/en/show/', '').rstrip('/')
        if show_id:
            # Check for date pattern (vf25-MM-DD-TIME)
            if re.match(r'vf\d{2}-\d{2}-\d{2}-\d{4}', show_id):
                patterns['standard'] += 1
            else:
                patterns['other'] += 1
    
    return issues, patterns

def validate_booking_urls(urls):
    """Validate Booking URLs format"""
    issues = []
    param_stats = defaultdict(int)
    
    for url in urls:
        parsed = urlparse(url)
        
        # Check domain
        if parsed.netloc != 'ticketing.verbierfestival.com':
            issues.append(f"Wrong domain: {url}")
        
        # Check path
        if parsed.path != '/selection/event/seat':
            issues.append(f"Wrong path: {url}")
        
        # Check parameters
        params = parse_qs(parsed.query)
        if 'perfId' not in params:
            issues.append(f"Missing perfId: {url}")
        if 'productId' not in params:
            issues.append(f"Missing productId: {url}")
        
        # Count parameter patterns
        if 'perfId' in params and 'productId' in params:
            param_stats['complete'] += 1
        else:
            param_stats['incomplete'] += 1
    
    return issues, param_stats

def find_duplicates(urls):
    """Find duplicate URLs"""
    seen = {}
    duplicates = []
    
    for i, url in enumerate(urls):
        if url in seen:
            duplicates.append((i, seen[url], url))
        else:
            seen[url] = i
    
    return duplicates

def main():
    file_path = '/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt'
    
    print("=" * 80)
    print("VERBIER FESTIVAL URL VALIDATION REPORT")
    print("=" * 80)
    
    # Extract URLs
    event_urls, booking_urls = extract_urls(file_path)
    
    print(f"\n📊 SUMMARY:")
    print(f"  • Total EVENT_METADATA blocks found: {len(event_urls)}")
    print(f"  • Total Event URLs: {len(event_urls)}")
    print(f"  • Total Booking URLs: {len(booking_urls)}")
    
    # Validate Event URLs
    print(f"\n🔍 EVENT URL VALIDATION:")
    event_issues, event_patterns = validate_event_urls(event_urls)
    
    if event_issues:
        print(f"  ⚠️  Found {len(event_issues)} issues:")
        for issue in event_issues[:10]:  # Show first 10
            print(f"    - {issue}")
        if len(event_issues) > 10:
            print(f"    ... and {len(event_issues) - 10} more")
    else:
        print("  ✅ All Event URLs follow correct format")
    
    print(f"  📈 URL Patterns:")
    for pattern, count in event_patterns.items():
        print(f"    - {pattern}: {count}")
    
    # Validate Booking URLs
    print(f"\n🔍 BOOKING URL VALIDATION:")
    booking_issues, booking_stats = validate_booking_urls(booking_urls)
    
    if booking_issues:
        print(f"  ⚠️  Found {len(booking_issues)} issues:")
        for issue in booking_issues[:10]:  # Show first 10
            print(f"    - {issue}")
        if len(booking_issues) > 10:
            print(f"    ... and {len(booking_issues) - 10} more")
    else:
        print("  ✅ All Booking URLs follow correct format")
    
    print(f"  📈 Parameter Statistics:")
    for stat, count in booking_stats.items():
        print(f"    - {stat}: {count}")
    
    # Check for duplicates
    print(f"\n🔍 DUPLICATE CHECK:")
    event_dupes = find_duplicates(event_urls)
    booking_dupes = find_duplicates(booking_urls)
    
    if event_dupes:
        print(f"  ⚠️  Found {len(event_dupes)} duplicate Event URLs:")
        for idx1, idx2, url in event_dupes[:5]:
            print(f"    - Positions {idx2+1} and {idx1+1}: {url}")
    else:
        print("  ✅ No duplicate Event URLs")
    
    if booking_dupes:
        print(f"  ⚠️  Found {len(booking_dupes)} duplicate Booking URLs:")
        for idx1, idx2, url in booking_dupes[:5]:
            print(f"    - Positions {idx2+1} and {idx1+1}: {url}")
    else:
        print("  ✅ No duplicate Booking URLs")
    
    # Sample URLs for manual checking
    print(f"\n📋 SAMPLE URLS FOR MANUAL VERIFICATION:")
    print("  Event URLs (first 5):")
    for i, url in enumerate(event_urls[:5], 1):
        print(f"    {i}. {url}")
    
    print("  Booking URLs (first 5):")
    for i, url in enumerate(booking_urls[:5], 1):
        print(f"    {i}. {url}")
    
    print("\n" + "=" * 80)
    
    # Generate recommendations
    print("💡 RECOMMENDATIONS:")
    if event_issues or booking_issues:
        print("  1. Review and fix URLs with formatting issues")
    if event_dupes or booking_dupes:
        print("  2. Remove or update duplicate URLs")
    print("  3. Test a sample of URLs to verify they're still active")
    print("  4. Consider updating to 2025 festival dates if these are 2024 URLs")
    
    print("=" * 80)

if __name__ == "__main__":
    main()