import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.scss';
import FormInput from '@/components/FormInput/FormInput';
import Button from '@/components/Button/Button';

interface SearchBarProps {
  onSearch: (query: string, cursor: string | null) => void;
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
  const searchTriggered = useRef(false);
  const selectingSuggestion = useRef(false);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        selectSuggestion(suggestions[focusedIndex]);
      } else {
        handleSearch();
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Handle selecting a suggestion
  const selectSuggestion = (suggestion: string) => {
    selectingSuggestion.current = true;
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.trim();
    setQuery(term);
    if (term === '') {
      setSuggestions([]);
      searchTriggered.current = false;
    }
    setFocusedIndex(-1);
  };

  // Handle performing a search
  const handleSearch = (searchQuery?: string, cursor = null) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch) return;
    searchTriggered.current = true;
    setShowSuggestions(false);
    onSearch(queryToSearch, cursor);
    setTimeout(() => {
      searchTriggered.current = false;
    }, 500);
  };

  useEffect(() => {
    if (
      query &&
      query.length >= 3 &&
      !searchTriggered.current &&
      !selectingSuggestion.current
    ) {
      fetchSuggestions(query).then((results) => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, fetchSuggestions]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <FormInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          label="Search"
          hideLabel
          id="search"
          value={query}
          onFocus={() => {
            if (query.length >= 3) setShowSuggestions(true);
            selectingSuggestion.current = false;
          }}
          onChange={handleSearchInput}
          placeholder="Search for images..."
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={showSuggestions ? 'true' : 'false'}
          aria-activedescendant={
            focusedIndex >= 0 ? `suggestion-${focusedIndex}` : undefined
          }
          role="combobox"
        />
        <Button
          buttonType="button"
          styleType="primary"
          onClick={() => handleSearch()}
        >
          🔍
        </Button>
      </div>
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
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
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
