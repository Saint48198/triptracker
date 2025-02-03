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
  const searchTriggered = useRef(false);
  const selectingSuggestion = useRef(false);

  //  Handle keyboard navigation
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
      }
      setShowSuggestions(false);
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  //  Handle selecting a suggestion
  const selectSuggestion = (suggestion: string) => {
    selectingSuggestion.current = true;
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }, 100);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.trim(); // Trim unnecessary spaces
    setQuery(term);
    if (term === '') {
      setSuggestions([]); // Clear suggestions
      searchTriggered.current = false; // Prevent search trigger
    }

    setFocusedIndex(-1); // Reset focus index
  };

  //  Handle performing a search with Enter key or Search button
  const handleSearch = () => {
    searchTriggered.current = true;
    setShowSuggestions(false);
    selectingSuggestion.current = true;
    onSearch(query);

    setTimeout(() => {
      searchTriggered.current = false;
    }, 500);
  };

  //  Close search suggestions when clicking outside the search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !inputRef.current?.contains(event.target as Node) && //  Click is outside search input
        !listRef.current?.contains(event.target as Node) //  Click is outside suggestions list
      ) {
        selectingSuggestion.current = true;
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setSuggestions([]); //  Clears suggestions when query is too short
      setShowSuggestions(false);
    }
  }, [query, fetchSuggestions]);

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
          handleSearch();
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
          onFocus={() => {
            if (query.length >= 3) setShowSuggestions(true); //  Show suggestions only when there’s a valid query
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
              onMouseDown={(e) => {
                e.preventDefault(); //  Prevents re-focusing on input
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
