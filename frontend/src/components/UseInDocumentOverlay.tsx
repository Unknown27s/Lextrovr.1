import React, { useState } from 'react';

interface UseInDocumentOverlayProps {
    isOpen: boolean;
    word?: string;
    onClose: () => void;
}

const UseInDocumentOverlay: React.FC<UseInDocumentOverlayProps> = ({
    isOpen,
    word = 'word',
    onClose,
}) => {
    const [voice, setVoice] = useState('professional');
    const [contextSnippet, setContextSnippet] = useState('');
    const [preview, setPreview] = useState('');
    const [generating, setGenerating] = useState(false);

    const voices = [
        { id: 'professional', label: 'Professional' },
        { id: 'casual', label: 'Casual' },
        { id: 'dark', label: 'Dark/Moody' },
        { id: 'comedic', label: 'Comedic' },
        { id: 'archaic', label: 'Archaic' },
    ];

    const handleGenerate = async () => {
        setGenerating(true);
        // Simulate API call to generate preview
        setTimeout(() => {
            setPreview(`The ${word} nature of the project became apparent as we progressed.`);
            setGenerating(false);
        }, 500);
    };

    const handleCopy = () => {
        if (preview) {
            navigator.clipboard.writeText(preview);
            alert('Copied to clipboard!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6">
                <button
                    onClick={onClose}
                    className="float-right text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Use in Document</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Writing Voice
                    </label>
                    <select
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                        {voices.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Context (optional)
                    </label>
                    <textarea
                        value={contextSnippet}
                        onChange={(e) => setContextSnippet(e.target.value)}
                        placeholder="Paste a snippet of your writing for context..."
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 h-20"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 mb-4"
                >
                    {generating ? 'Generating...' : 'Generate Preview'}
                </button>

                {preview && (
                    <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                        <p className="text-gray-900 dark:text-white italic">{preview}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 font-medium transition"
                    >
                        Close
                    </button>
                    {preview && (
                        <button
                            onClick={handleCopy}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                        >
                            Copy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UseInDocumentOverlay;
