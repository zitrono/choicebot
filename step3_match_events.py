#!/usr/bin/env python3
"""
Step 3: Match events from verbier.txt with scraped URLs
This creates a mapping between text events and their corresponding URLs
"""

import json
import re
from difflib import SequenceMatcher
from datetime import datetime

def load_scraped_events(file_path):
    """Load scraped events from JSON"""
    with open(file_path, 'r') as f:
        return json.load(f)

def extract_events_from_text(file_path):
    """Extract all events from verbier.txt with better pattern matching"""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    events = []
    
    # Split by page markers to process section by section
    pages = content.split('--- Page')
    
    for page_num, page_content in enumerate(pages):
        if not page_content.strip():
            continue
            
        lines = page_content.split('\n')
        
        # Look for date patterns in the page
        for i, line in enumerate(lines):
            # Date patterns
            date_match = re.search(r'(\d{1,2})\s+(juillet|July)', line, re.IGNORECASE)
            if not date_match:
                # Also check for format: Je. 17.07
                date_match = re.match(r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.\s+(\d{2})\.(\d{2})', line)
                
            if date_match:
                event = {
                    'page': page_num,
                    'line_num': i,
                    'raw_line': line.strip()
                }
                
                # Extract date
                if '.' in line and re.match(r'^(Lu|Ma|Me|Je|Ve|Sa|Di)\.', line):
                    # Format: Je. 17.07
                    parts = line.split('.')
                    if len(parts) >= 3:
                        day = parts[1].strip()
                        month = parts[2].strip()
                        event['date'] = f"{day}.{month}"
                else:
                    # Format: 17 juillet
                    day = date_match.group(1) if date_match.group(1) else date_match.group(2)
                    event['date'] = f"{day.zfill(2)}.07"  # Assume July
                
                # Look for time in nearby lines
                for j in range(max(0, i-2), min(len(lines), i+5)):
                    time_match = re.search(r'(\d{1,2})[h:](\d{2})', lines[j])
                    if time_match:
                        event['time'] = f"{time_match.group(1)}:{time_match.group(2)}"
                        break
                
                # Look for venue
                venues = ['EGLISE', 'ÉGLISE', 'SALLE DES COMBINS', 'ÉGLISE DE VERBIER',
                         'VICTORIA HALL', 'CINÉMA', 'MEDRAN', 'JARDIN']
                
                for j in range(max(0, i-2), min(len(lines), i+10)):
                    for venue in venues:
                        if venue in lines[j].upper():
                            event['venue'] = venue
                            break
                
                # Look for EVENT_METADATA
                metadata_start = -1
                for j in range(i, min(len(lines), i+30)):
                    if '[EVENT_METADATA]' in lines[j]:
                        metadata_start = j
                        break
                
                if metadata_start > 0:
                    # Find metadata end
                    metadata_end = metadata_start
                    for j in range(metadata_start, min(len(lines), metadata_start+10)):
                        if '[/EVENT_METADATA]' in lines[j]:
                            metadata_end = j
                            break
                    
                    # Extract URLs
                    metadata_text = '\n'.join(lines[metadata_start:metadata_end+1])
                    event_url_match = re.search(r'Event_URL:\s*(https?://[^\s\n]+)', metadata_text)
                    
                    if event_url_match:
                        event['has_existing_metadata'] = True
                        event['existing_url'] = event_url_match.group(1)
                        # Extract event ID
                        url = event_url_match.group(1)
                        event_id = url.split('/')[-1].rstrip('/')
                        event['existing_event_id'] = event_id
                    else:
                        event['has_existing_metadata'] = False
                else:
                    event['has_existing_metadata'] = False
                
                # Collect context (artist names, titles)
                context = []
                for j in range(i, min(len(lines), i+10)):
                    line_text = lines[j].strip()
                    if line_text and not line_text.startswith('[') and len(line_text) > 3:
                        context.append(line_text)
                event['context'] = ' | '.join(context[:5])
                
                events.append(event)
    
    return events

def match_events(text_events, scraped_events):
    """Match events from text to scraped URLs"""
    
    matched = []
    unmatched_text = []
    unmatched_scraped = list(scraped_events)  # Copy to track unused URLs
    
    for text_event in text_events:
        best_match = None
        best_score = 0
        best_index = -1
        
        # If event already has metadata, try to find exact match
        if text_event.get('has_existing_metadata'):
            existing_id = text_event.get('existing_event_id', '')
            for idx, scraped in enumerate(unmatched_scraped):
                if scraped['event_id'] == existing_id:
                    best_match = scraped
                    best_index = idx
                    best_score = 1.0
                    break
        
        # If no exact match, try fuzzy matching
        if not best_match:
            text_date = text_event.get('date', '')
            text_time = text_event.get('time', '')
            
            for idx, scraped in enumerate(unmatched_scraped):
                score = 0
                
                # Date matching
                scraped_date = scraped.get('date', '')
                if text_date and scraped_date:
                    if text_date == scraped_date:
                        score += 0.5
                    elif text_date.replace('.', '') in scraped_date.replace('.', ''):
                        score += 0.3
                
                # Time matching
                scraped_time = scraped.get('time', '')
                if text_time and scraped_time:
                    # Normalize times
                    text_time_norm = text_time.replace('h', ':').replace('H', ':')
                    if text_time_norm == scraped_time:
                        score += 0.4
                    elif text_time_norm.replace(':', '') in scraped_time.replace(':', ''):
                        score += 0.2
                
                # Context matching (look for artist names in event ID)
                if 'context' in text_event:
                    context_lower = text_event['context'].lower()
                    event_id_lower = scraped['event_id'].lower()
                    
                    # Check for common keywords
                    keywords = ['ravel', 'academy', 'rencontres', 'orchestra', 'vfo', 'vfco', 'vfjo']
                    for keyword in keywords:
                        if keyword in context_lower and keyword in event_id_lower:
                            score += 0.1
                
                if score > best_score:
                    best_score = score
                    best_match = scraped
                    best_index = idx
        
        if best_match and best_score > 0.4:  # Threshold for matching
            matched.append({
                'text_event': text_event,
                'scraped_event': best_match,
                'match_score': best_score
            })
            # Remove from unmatched list
            if best_index >= 0 and best_index < len(unmatched_scraped):
                unmatched_scraped.pop(best_index)
        else:
            unmatched_text.append(text_event)
    
    return matched, unmatched_text, unmatched_scraped

def main():
    print("=" * 80)
    print("STEP 3: MATCHING EVENTS FROM TEXT TO SCRAPED URLs")
    print("=" * 80)
    
    # Load data
    scraped_events = load_scraped_events('/Users/zitrono/dev/tmp/verbier/scraped_events.json')
    text_events = extract_events_from_text('/Users/zitrono/dev/tmp/verbier/verbier-demo/data/verbier.txt')
    
    print(f"\n📊 INPUT DATA:")
    print(f"  • Text events extracted: {len(text_events)}")
    print(f"  • Scraped URLs available: {len(scraped_events)}")
    
    # Perform matching
    matched, unmatched_text, unmatched_scraped = match_events(text_events, scraped_events)
    
    print(f"\n🎯 MATCHING RESULTS:")
    print(f"  • Successfully matched: {len(matched)}")
    print(f"  • Text events without URL: {len(unmatched_text)}")
    print(f"  • Scraped URLs not used: {len(unmatched_scraped)}")
    
    # Show high-confidence matches
    print(f"\n✅ HIGH CONFIDENCE MATCHES (score > 0.8):")
    high_conf = [m for m in matched if m['match_score'] > 0.8]
    for match in high_conf[:5]:
        text = match['text_event']
        scraped = match['scraped_event']
        print(f"  • Date: {text.get('date', 'N/A')} Time: {text.get('time', 'N/A')}")
        print(f"    → Matched to: {scraped['event_id']}")
        print(f"    Score: {match['match_score']:.2f}")
    
    # Show unmatched text events
    print(f"\n❓ TEXT EVENTS WITHOUT MATCHES:")
    for event in unmatched_text[:5]:
        print(f"  • Date: {event.get('date', 'N/A')} Time: {event.get('time', 'N/A')}")
        print(f"    Context: {event.get('context', 'N/A')[:60]}...")
    
    # Save matching results
    output = {
        'matched': matched,
        'unmatched_text': unmatched_text,
        'unmatched_scraped': unmatched_scraped,
        'statistics': {
            'total_text_events': len(text_events),
            'total_scraped_urls': len(scraped_events),
            'matched_count': len(matched),
            'unmatched_text_count': len(unmatched_text),
            'unmatched_scraped_count': len(unmatched_scraped)
        }
    }
    
    output_path = '/Users/zitrono/dev/tmp/verbier/event_matching.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n✅ Saved matching results to {output_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()