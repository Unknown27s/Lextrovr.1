module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Warm neutrals for light mode
                'warm-white': '#FAF9F6',
                'warm-gray': '#F5F3F0',
                'warm-gray-dark': '#E8E6E3',

                // Deep teal accent
                'accent-teal': '#2C7A7B',
                'accent-teal-light': '#319795',
                'accent-teal-dark': '#234E52',

                // Literary violet accent
                'accent-violet': '#6B46C1',
                'accent-violet-light': '#805AD5',

                // Text colors
                'text-primary': '#1A1A1A',
                'text-secondary': '#4A5568',
                'text-muted': '#718096',
                'text-light': '#A0AEC0',

                // Card & surface colors
                'card-bg': '#FFFFFF',
                'surface-warm': '#FEFDFB',
            },
            fontFamily: {
                serif: ['Crimson Pro', 'Lora', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                'word-title': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
                'word-title-lg': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
                'body': ['16px', { lineHeight: '1.6' }],
                'body-sm': ['14px', { lineHeight: '1.5' }],
            },
            borderRadius: {
                'card': '12px',
                'card-lg': '16px',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
                'card-elevated': '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
            },
            spacing: {
                'card-padding': '16px',
                'card-margin': '16px',
            },
        },
    },
    plugins: [],
};