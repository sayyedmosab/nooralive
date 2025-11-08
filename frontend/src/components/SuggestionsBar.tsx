import React from 'react';

interface SuggestionsBarProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionsBar: React.FC<SuggestionsBarProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      text: 'What projects do we have for 2027?',
      label: '2027 Projects'
    },
    {
      text: 'Show me project progress for digital initiatives',
      label: 'Project Progress'
    },
    {
      text: 'Which capabilities have the lowest maturity?',
      label: 'Capability Maturity'
    },
    {
      text: 'What are the strategic objectives for 2025?',
      label: 'Strategic Objectives'
    }
  ];

  return (
    <div className="suggestions">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="suggestion"
          onClick={() => onSuggestionClick(suggestion.text)}
          style={{
            padding: '8px 15px',
            background: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '15px',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'inline-block',
            marginRight: '10px',
            marginBottom: '15px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#bbdefb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#e3f2fd';
          }}
        >
          {suggestion.label}
        </div>
      ))}
    </div>
  );
};

export default SuggestionsBar;
