import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.scss';
import FormInput from '@/components/FormInput/FormInput';
import Button from '@/components/Button/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  fetchSuggestions,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedManually = useRef(false); // ✅ Prevents unwanted API calls
  const submittedManually = useRef(false); // ✅ Prevents reopening on Enter / search button

  // ✅ Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      if (focusedIndex >= 0) {
        selectSuggestion(suggestions[focusedIndex]); // Select suggestion
      } else {
        performSearch(query); // Perform normal search
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // ✅ Handle selecting a suggestion
  const selectSuggestion = (suggestion: string) => {
    selectedManually.current = true; // ✅ Prevents triggering another search
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
    inputRef.current?.focus();

    setTimeout(() => {
      selectedManually.current = false; // ✅ Reset after short delay
    }, 500);
  };

  // ✅ Handle performing a normal search (Enter or button click)
  const performSearch = (searchQuery: string) => {
    submittedManually.current = true;
    setShowSuggestions(false); // ✅ Close suggestion box on search
    onSearch(searchQuery);

    setTimeout(() => {
      submittedManually.current = false; // ✅ Reset to allow new searches
    }, 500);
  };

  // ✅ Fetch suggestions only when manually typing (not selecting)
  useEffect(() => {
    if (
      query &&
      query.length >= 3 &&
      !selectedManually.current &&
      !submittedManually.current
    ) {
      fetchSuggestions(query).then((results) => {
        if (!selectedManually.current && !submittedManually.current) {
          // ✅ Prevent reopening after selection
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, fetchSuggestions]);

  // ✅ Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={styles.searchContainer}
      role="combobox"
      aria-expanded={showSuggestions}
      aria-owns="suggestions-list"
      aria-haspopup="listbox"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          performSearch(query);
        }}
        className={styles.searchForm}
      >
        <FormInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          label="Search"
          hideLabel
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={showSuggestions ? 'true' : 'false'}
          aria-activedescendant={
            focusedIndex >= 0 ? `suggestion-${focusedIndex}` : undefined
          }
        />
        <Button buttonType="submit" styleType="primary">
          🔍
        </Button>
      </form>

      {showSuggestions && (
        <ul
          className={styles.suggestionsList}
          id="suggestions-list"
          ref={listRef}
          role="listbox"
          aria-live="polite"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={focusedIndex === index}
              onClick={() => selectSuggestion(suggestion)}
              className={`${styles.suggestionItem} ${focusedIndex === index ? styles.active : ''}`}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
