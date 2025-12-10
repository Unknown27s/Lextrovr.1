#!/usr/bin/env node

/**
 * Dictionary Classification Script
 * Analyzes and classifies all words in dictionary.json by categories
 * Run: node classify-dictionary.js
 */

const fs = require('fs');
const path = require('path');

// Category keywords and patterns
const CATEGORY_KEYWORDS = {
    emotion: [
        'happy', 'sad', 'angry', 'fear', 'joy', 'sorrow', 'glad', 'grief',
        'despair', 'hope', 'love', 'hate', 'envy', 'jealous', 'pride', 'shame',
        'content', 'anxious', 'excited', 'terrified', 'delighted', 'miserable',
        'jubilant', 'melancholy', 'serene', 'volatile', 'placid', 'blustery',
        'despairing', 'hopeful', 'cheerful', 'gloomy', 'elated', 'downcast',
        'mood', 'feeling', 'sentiment', 'affect', 'emotion'
    ],
    expression: [
        'say', 'speak', 'talk', 'tell', 'voice', 'articulate', 'utter', 'express',
        'communicate', 'convey', 'declare', 'announce', 'proclaim', 'state',
        'leer', 'glare', 'smirk', 'grimace', 'scowl', 'sneer', 'bemoan',
        'gesture', 'signal', 'indicate', 'show', 'display', 'reveal', 'phrase',
        'remark', 'comment', 'mention', 'note', 'observe', 'exclaim', 'mutter'
    ],
    movement: [
        'walk', 'run', 'move', 'go', 'come', 'travel', 'journey', 'traverse',
        'meander', 'trudge', 'scurry', 'cavort', 'amble', 'saunter', 'skulk',
        'pace', 'stride', 'sprint', 'jog', 'dash', 'rush', 'hurry', 'hasten',
        'creep', 'crawl', 'drag', 'pull', 'push', 'roll', 'slide',
        'march', 'parade', 'strut', 'shuffle', 'stagger', 'stumble', 'totter'
    ],
    action: [
        'do', 'make', 'act', 'perform', 'execute', 'accomplish', 'achieve',
        'attack', 'defend', 'fight', 'strike', 'hit', 'punch', 'kick',
        'build', 'create', 'construct', 'craft', 'fashion', 'form', 'shape',
        'break', 'destroy', 'ruin', 'damage', 'harm', 'injure', 'hurt',
        'take', 'grab', 'seize', 'capture', 'catch', 'hold', 'grasp',
        'lurk', 'hide', 'conceal', 'prowl', 'stalk', 'hunt',
        'eat', 'drink', 'consume', 'feast', 'dine', 'sup', 'munch'
    ],
    place: [
        'place', 'location', 'space', 'area', 'region', 'zone', 'territory',
        'house', 'home', 'building', 'structure', 'mansion', 'cottage', 'cabin',
        'mountain', 'hill', 'valley', 'vale', 'precipice', 'cliff', 'ridge',
        'forest', 'wood', 'jungle', 'desert', 'prairie', 'plain', 'field',
        'sea', 'ocean', 'lake', 'river', 'stream', 'creek', 'spring',
        'city', 'town', 'village', 'hamlet', 'settlement', 'community',
        'church', 'temple', 'shrine', 'cathedral', 'chapel', 'sanctuary'
    ],
    quality: [
        'good', 'bad', 'nice', 'ugly', 'beautiful', 'pretty', 'handsome',
        'smart', 'intelligent', 'stupid', 'foolish', 'wise', 'clever',
        'strong', 'weak', 'powerful', 'fragile', 'robust', 'delicate',
        'fast', 'slow', 'quick', 'rapid', 'swift', 'sluggish', 'speedy',
        'big', 'small', 'large', 'tiny', 'huge', 'little', 'massive',
        'hot', 'cold', 'warm', 'cool', 'freezing', 'scorching', 'tepid',
        'bright', 'dark', 'light', 'dim', 'shining', 'dull', 'luminous'
    ]
};

function classifyWord(word, definition) {
    const categories = [];
    const definitionLower = definition.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => definitionLower.includes(keyword))) {
            categories.push(category);
        }
    }

    return categories.length > 0 ? categories : ['other'];
}

async function analyzeDictionary(dictPath) {
    console.log(`📖 Loading dictionary from ${dictPath}...`);

    const dictionary = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));
    const words = Object.entries(dictionary);

    console.log(`✅ Loaded ${words.length} words`);
    console.log(`\n🔍 Classifying words by category...`);

    // Initialize category buckets
    const classified = {
        emotion: {},
        expression: {},
        movement: {},
        action: {},
        place: {},
        quality: {},
        other: {}
    };

    // Classify each word
    let processed = 0;
    for (const [word, definition] of words) {
        const categories = classifyWord(word, definition);
        const primaryCategory = categories[0];
        classified[primaryCategory][word] = definition;

        processed++;
        if (processed % 10000 === 0) {
            console.log(`  Processed: ${processed}/${words.length}`);
        }
    }

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('DICTIONARY CLASSIFICATION RESULTS');
    console.log('='.repeat(60));

    let total = 0;
    for (const [category, categoryWords] of Object.entries(classified)) {
        const count = Object.keys(categoryWords).length;
        total += count;
        const percentage = ((count / words.length) * 100).toFixed(1);
        console.log(`\n${category.toUpperCase().padEnd(15)}: ${String(count).padStart(6)} words (${String(percentage).padStart(5)}%)`);

        // Show sample words
        if (count > 0) {
            const samples = Object.keys(categoryWords).slice(0, 5);
            console.log(`  Samples: ${samples.join(', ')}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`TOTAL WORDS: ${total}`);
    console.log('='.repeat(60) + '\n');

    // Save classified dictionary
    const outputPath = dictPath.replace('.json', '_classified.json');
    console.log(`💾 Saving classified dictionary to ${outputPath}...`);
    fs.writeFileSync(outputPath, JSON.stringify(classified, null, 2), 'utf-8');
    console.log(`✅ Classified dictionary saved! (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);

    // Create statistics file
    const statsPath = dictPath.replace('.json', '_stats.json');
    const stats = {
        total_words: total,
        total_file_size: `${(fs.statSync(dictPath).size / 1024 / 1024).toFixed(2)} MB`,
        generated_at: new Date().toISOString(),
        categories: {}
    };

    for (const [category, categoryWords] of Object.entries(classified)) {
        const count = Object.keys(categoryWords).length;
        stats.categories[category] = {
            count,
            percentage: parseFloat(((count / words.length) * 100).toFixed(2)),
            samples: Object.keys(categoryWords).slice(0, 10)
        };
    }

    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');
    console.log(`✅ Statistics saved to ${statsPath}!`);

    // Print size comparison
    console.log(`\n📊 File Size Comparison:`);
    console.log(`  Original: ${(fs.statSync(dictPath).size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Classified: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

// Main execution
const dictPath = path.join(__dirname, '../frontend/src/data/dictionary.json');

if (fs.existsSync(dictPath)) {
    analyzeDictionary(dictPath).catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
} else {
    console.error(`❌ Dictionary not found at ${dictPath}`);
    process.exit(1);
}
