// Test Script to verify offline dictionary access
// Run this in browser console or integrate into app

export async function testOfflineDictionary() {
    console.log('🔍 Testing Offline Dictionary Access...');

    try {
        // Import the dictionary
        const dict = await import('../data/dictionary.json');
        const offlineDictionary = dict.default;

        console.log('✅ Dictionary loaded successfully');
        console.log('📊 Total words in dictionary:', Object.keys(offlineDictionary).length);

        // Test a few words
        const testWords = ['eloquent', 'ephemeral', 'ubiquitous', 'pragmatic', 'serendipity'];

        console.log('\n🧪 Testing specific words:');
        testWords.forEach(word => {
            if (offlineDictionary[word]) {
                console.log(`✅ ${word}: Found`);
            } else {
                console.log(`❌ ${word}: NOT FOUND`);
            }
        });

        // Show some sample entries
        console.log('\n📚 Sample entries from dictionary:');
        const sampleWords = Object.keys(offlineDictionary).slice(0, 5);
        sampleWords.forEach(word => {
            console.log(`${word}: ${offlineDictionary[word].substring(0, 100)}...`);
        });

    } catch (error) {
        console.error('❌ Failed to load offline dictionary:', error);
    }
}

// Export for testing
if (typeof window !== 'undefined') {
    (window as any).testOfflineDictionary = testOfflineDictionary;
}
