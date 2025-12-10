import React, { useState } from 'react';

interface WordTypeSelectorProps {
    onTypeSelect: (type: string) => void;
    loading?: boolean;
}

export default function WordTypeSelector({ onTypeSelect, loading = false }: WordTypeSelectorProps) {
    const [selectedType, setSelectedType] = useState('random');

    const wordTypes = [
        { id: 'random', label: 'Random', icon: '🎲' },
        { id: 'expression', label: 'Expression', icon: '💬' },
        { id: 'emotion', label: 'Emotion', icon: '😊' },
        { id: 'action', label: 'Action', icon: '⚡' },
        { id: 'place', label: 'Place', icon: '🏞️' },
        { id: 'movement', label: 'Movement', icon: '🚶' },
    ];

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        onTypeSelect(type);
    };

    return (
        <div className="px-4 py-3 bg-white border-b border-warm-gray">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                What type of word would you like?
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {wordTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleTypeChange(type.id)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all flex items-center gap-2 ${selectedType === type.id
                            ? 'bg-accent-teal text-white shadow-md'
                            : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                            } disabled:opacity-50`}
                    >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
