# Writing Practice / Missing-Word Exercise Feature

## Overview

The **Writing Practice** feature is a comprehensive learning tool that generates missing-word exercises to help users improve their vocabulary and writing skills. It uses AI-powered paragraph generation, smart word extraction, and intelligent hint generation from external APIs.

## Features

### 1. **Automatic Exercise Generation**
- Generates 100-200 word paragraphs on various topics
- Intelligent word extraction (3-7 important words per exercise)
- Maintains paragraph coherence and meaning
- Three difficulty levels for progressive learning

### 2. **Difficulty Levels**

#### Easy
- Common, everyday vocabulary
- Simple sentence structures
- Good for beginners and language learners
- Example words: walking, park, trees, beautiful, stone

#### Medium
- Moderate vocabulary
- More complex sentences
- For intermediate learners
- Example words: discovered, medieval, commerce, scholars, analyzed

#### Hard
- Advanced and academic vocabulary
- Complex sentence structures
- For advanced learners and writers
- Example words: epistemological, paradigm, indeterminacy, phenomena

### 3. **Smart Hint System**

Hints are generated using two free APIs:

#### Dictionary API (dictionaryapi.dev)
- Provides clear, learner-friendly definitions
- Shows pronunciation and examples
- Used as primary hint source

#### Datamuse API
- Finds synonyms and related words
- Helps when dictionary lookup fails
- Provides alternative hint suggestions

Example hints:
- "Definition: opposite of setting"
- "Synonym: small town"
- "Word type: verb, meaning to move upward"

### 4. **User Interaction**

Users can:
- ✅ Fill in blanks with their answers
- ✅ Request hints for difficult words
- ✅ Submit all answers at once
- ✅ See immediate feedback (correct/incorrect)
- ✅ View the correct answers after submission
- ✅ Track their score and performance
- ✅ Generate new exercises with one click
- ✅ Switch difficulty levels anytime

### 5. **Score Tracking**

After completing an exercise:
- Shows correct/total answers (e.g., 5/6)
- Displays percentage score
- Provides encouraging feedback
- Saves progress to localStorage

## JSON Output Format

Each exercise returns data in this exact format:

```json
{
  "id": "exercise_1702000000_abc123def",
  "difficulty": "medium",
  "paragraph_original": "The ancient manuscript lay hidden in the basement...",
  "paragraph_with_blanks": "The ancient ____ lay hidden in the ____...",
  "missing_words": [
    {
      "blank_number": 1,
      "word": "manuscript",
      "hint": "An original written or typed version of a book or document",
      "position": 2
    },
    {
      "blank_number": 2,
      "word": "archives",
      "hint": "A collection of historical records and documents",
      "position": 6
    }
  ],
  "topic": "History",
  "created_at": "2025-12-06T09:23:12.000Z"
}
```

## File Structure

### Services

#### `src/services/exerciseGenerator.ts`
- **Purpose**: Core exercise generation logic
- **Key Functions**:
  - `generateExercise()`: Creates complete exercise with paragraph, blanks, and hints
  - `extractImportantWords()`: Intelligently selects 3-7 important words
  - `createBlanks()`: Replaces words with `____` placeholders
  - `generateHint()`: Calls external APIs for intelligent hints
  - `validateAnswer()`: Checks if user answer matches correct word
  - `getFeedback()`: Generates encouraging feedback messages

#### `src/services/exerciseStorage.ts`
- **Purpose**: localStorage persistence for exercise progress
- **Key Functions**:
  - `saveProgress()`: Stores user's answers and score
  - `getProgressList()`: Retrieves all completed exercises
  - `getStats()`: Calculates performance statistics
  - `clearProgress()`: Clears all saved progress

### Components

#### `src/components/WritingPractice.tsx`
- **Purpose**: Main UI component for the exercise interface
- **Features**:
  - Displays paragraph with interactive input fields
  - Shows hints on demand
  - Difficulty selector (Easy/Medium/Hard)
  - Real-time feedback for each answer
  - Score calculation and display
  - "Next Exercise" button for continuous learning
  - Original paragraph reference

## How It Works

### Step 1: Generate Exercise
```typescript
const exercise = await exerciseGenerator.generateExercise('medium');
```

### Step 2: Display to User
- Paragraph appears with blanks: `____`
- User enters answers in input fields
- User can request hints for any blank

### Step 3: Submit Answers
- User clicks "Submit Answers"
- Each answer is validated against correct word
- Feedback is displayed immediately

### Step 4: Show Results
- Score displayed (e.g., 5/6 = 83%)
- Correct answers revealed
- Option to generate new exercise

## API Integration

### External APIs Used

1. **Datamuse API**
   - Endpoint: `https://api.datamuse.com/words`
   - Used for: Synonym suggestions, related words
   - No authentication required
   - Example: `GET /words?ml=forest` (synonyms for "forest")

2. **Dictionary API**
   - Endpoint: `https://api.dictionaryapi.dev/api/v2/entries/en`
   - Used for: Definitions and pronunciation
   - No authentication required
   - Example: `GET /entries/en/hello`

### Error Handling
- If Dictionary API fails, fallback to Datamuse
- If Datamuse fails, use generic hint (letter count, word type)
- Always provide a hint, never leave blank empty

## Paragraph Templates

### Easy Level (5 templates)
- Short, simple sentences
- Everyday vocabulary
- Stories and daily experiences

### Medium Level (5 templates)
- Mixed sentence length
- Academic vocabulary
- Historical, scientific, cultural topics

### Hard Level (5 templates)
- Complex sentences
- Advanced vocabulary
- Philosophical, technical, academic topics

## Performance Metrics

Track user performance with:
```typescript
const stats = exerciseStorageApi.getStats();
// Returns:
// {
//   totalExercises: 10,
//   completedExercises: 8,
//   averageScore: 78,
//   difficultyStats: {
//     easy: { completed: 3, average: 92 },
//     medium: { completed: 3, average: 81 },
//     hard: { completed: 2, average: 65 }
//   }
// }
```

## Integration with Main App

The Writing Practice feature is integrated into the **Editor** tab:

```tsx
{activeTab === 'editor' && (
    <WritingPractice />
)}
```

Users can:
1. Click "Editor" in bottom navigation
2. See the Writing Practice interface
3. Select difficulty level
4. Begin filling in blanks
5. Submit and track progress

## Future Enhancements

Possible improvements:
- [ ] Add timed exercises (30s, 60s, 90s)
- [ ] Implement spaced repetition algorithm
- [ ] Add voice pronunciation for hints
- [ ] Create custom word lists
- [ ] Export progress to CSV/PDF
- [ ] Multiplayer challenges
- [ ] Difficulty adjustment based on performance
- [ ] Audio pronunciation of words
- [ ] Mobile-specific optimizations

## Styling

The component uses the app's warm literary aesthetic:
- **Colors**: Warm neutrals, muted teal accent
- **Typography**: Crimson Pro serif for words, Inter sans for body
- **Layout**: Mobile-first, responsive design
- **Animations**: Smooth transitions, fade-ups

## Browser Compatibility

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Exercise not loading?
- Check internet connection (API calls required)
- Verify browser console for errors
- Try refreshing the page

### Hints not showing?
- One or both external APIs may be down
- Check network tab for failed requests
- System will show generic hint fallback

### Answers not validating?
- Ensure exact spelling match
- Leading/trailing spaces are trimmed
- Case-insensitive matching
- Punctuation is handled automatically

## Code Examples

### Generate and display exercise
```typescript
import { exerciseGenerator, WritingExercise } from '@/services/exerciseGenerator';

const exercise = await exerciseGenerator.generateExercise('easy');
console.log(exercise);
// {
//   id: "exercise_...",
//   difficulty: "easy",
//   paragraph_original: "...",
//   paragraph_with_blanks: "...",
//   missing_words: [...]
// }
```

### Validate user answer
```typescript
const isCorrect = exerciseGenerator.validateAnswer('rising', 'rising'); // true
const feedback = exerciseGenerator.getFeedback('rising', 'rising', true);
// "✓ Correct! "rising" is the right word."
```

### Get user statistics
```typescript
import { exerciseStorageApi } from '@/services/exerciseStorage';

const stats = exerciseStorageApi.getStats();
console.log(`Average score: ${stats.averageScore}%`);
```

---

**Version**: 1.0.0  
**Last Updated**: December 6, 2025  
**Author**: AI Assistant  
**Status**: Production Ready ✅
