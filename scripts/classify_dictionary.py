#!/usr/bin/env python3
"""
Dictionary Classification Script
Analyzes and classifies all words in dictionary.json by categories
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Set

# Category keywords and patterns
CATEGORY_KEYWORDS = {
    'emotion': [
        'happy', 'sad', 'angry', 'fear', 'joy', 'sorrow', 'glad', 'grief',
        'despair', 'hope', 'love', 'hate', 'envy', 'jealous', 'pride', 'shame',
        'content', 'anxious', 'excited', 'terrified', 'delighted', 'miserable',
        'jubilant', 'melancholy', 'serene', 'volatile', 'placid', 'blustery',
        'despairing', 'hopeful', 'cheerful', 'gloomy', 'elated', 'downcast',
        'mood', 'feeling', 'sentiment', 'affect', 'emotion'
    ],
    'expression': [
        'say', 'speak', 'talk', 'tell', 'voice', 'articulate', 'utter', 'express',
        'communicate', 'convey', 'declare', 'announce', 'proclaim', 'state',
        'leer', 'glare', 'smirk', 'grimace', 'scowl', 'sneer', 'bemoan',
        'gesture', 'signal', 'indicate', 'show', 'display', 'reveal', 'phrase',
        'remark', 'comment', 'mention', 'note', 'observe', 'exclaim', 'mutter'
    ],
    'movement': [
        'walk', 'run', 'move', 'go', 'come', 'travel', 'journey', 'traverse',
        'meander', 'trudge', 'scurry', 'cavort', 'amble', 'saunter', 'skulk',
        'pace', 'stride', 'sprint', 'jog', 'dash', 'rush', 'hurry', 'hasten',
        'creep', 'crawl', 'drag', 'pull', 'push', 'pull', 'roll', 'slide',
        'march', 'parade', 'strut', 'shuffle', 'stagger', 'stumble', 'totter'
    ],
    'action': [
        'do', 'make', 'act', 'perform', 'execute', 'accomplish', 'achieve',
        'attack', 'defend', 'fight', 'strike', 'hit', 'punch', 'kick',
        'build', 'create', 'construct', 'craft', 'fashion', 'form', 'shape',
        'break', 'destroy', 'ruin', 'damage', 'harm', 'injure', 'hurt',
        'take', 'grab', 'seize', 'capture', 'catch', 'hold', 'grasp',
        'lurk', 'hide', 'conceal', 'lurk', 'prowl', 'stalk', 'hunt',
        'eat', 'drink', 'consume', 'feast', 'dine', 'sup', 'munch'
    ],
    'place': [
        'place', 'location', 'space', 'area', 'region', 'zone', 'territory',
        'house', 'home', 'building', 'structure', 'mansion', 'cottage', 'cabin',
        'mountain', 'hill', 'valley', 'vale', 'precipice', 'cliff', 'ridge',
        'forest', 'wood', 'jungle', 'desert', 'prairie', 'plain', 'field',
        'sea', 'ocean', 'lake', 'river', 'stream', 'creek', 'spring',
        'city', 'town', 'village', 'hamlet', 'settlement', 'community',
        'church', 'temple', 'shrine', 'cathedral', 'chapel', 'sanctuary'
    ],
    'quality': [
        'good', 'bad', 'nice', 'ugly', 'beautiful', 'pretty', 'handsome',
        'smart', 'intelligent', 'stupid', 'foolish', 'wise', 'clever',
        'strong', 'weak', 'powerful', 'fragile', 'robust', 'delicate',
        'fast', 'slow', 'quick', 'rapid', 'swift', 'sluggish', 'speedy',
        'big', 'small', 'large', 'tiny', 'huge', 'little', 'massive',
        'hot', 'cold', 'warm', 'cool', 'freezing', 'scorching', 'tepid',
        'bright', 'dark', 'light', 'dim', 'shining', 'dull', 'luminous'
    ]
}

def load_dictionary(dict_path: str) -> Dict[str, str]:
    """Load the dictionary JSON file"""
    print(f"Loading dictionary from {dict_path}...")
    with open(dict_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def classify_word(word: str, definition: str) -> List[str]:
    """Classify a word based on keywords in its definition"""
    categories = []
    definition_lower = definition.lower()
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in definition_lower for keyword in keywords):
            categories.append(category)
    
    return categories if categories else ['other']

def analyze_dictionary(dict_path: str) -> None:
    """Analyze and classify all words in the dictionary"""
    
    dictionary = load_dictionary(dict_path)
    
    # Initialize category buckets
    classified = {
        'emotion': {},
        'expression': {},
        'movement': {},
        'action': {},
        'place': {},
        'quality': {},
        'other': {}
    }
    
    print(f"Analyzing {len(dictionary)} words...")
    
    # Classify each word
    for word, definition in dictionary.items():
        categories = classify_word(word, definition)
        primary_category = categories[0]
        
        classified[primary_category][word] = definition
    
    # Print results
    print("\n" + "="*60)
    print("DICTIONARY CLASSIFICATION RESULTS")
    print("="*60)
    
    total = 0
    for category, words in classified.items():
        count = len(words)
        total += count
        percentage = (count / len(dictionary)) * 100
        print(f"\n{category.upper():15} : {count:6} words ({percentage:5.1f}%)")
        
        # Show sample words
        if words:
            samples = list(words.keys())[:5]
            print(f"  Samples: {', '.join(samples)}")
    
    print("\n" + "="*60)
    print(f"TOTAL WORDS: {total}")
    print("="*60)
    
    # Save classified dictionary
    output_path = dict_path.replace('.json', '_classified.json')
    print(f"\nSaving classified dictionary to {output_path}...")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(classified, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Classified dictionary saved!")
    
    # Also create a statistics file
    stats_path = dict_path.replace('.json', '_stats.json')
    stats = {
        'total_words': total,
        'categories': {
            category: {
                'count': len(words),
                'percentage': round((len(words) / len(dictionary)) * 100, 2),
                'samples': list(words.keys())[:10]
            }
            for category, words in classified.items()
        }
    }
    
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Statistics saved to {stats_path}!")

if __name__ == '__main__':
    # Path to the dictionary
    dict_path = Path(__file__).parent.parent / 'data' / 'dictionary.json'
    
    if dict_path.exists():
        analyze_dictionary(str(dict_path))
    else:
        print(f"❌ Dictionary not found at {dict_path}")
