import { filterList } from '../utils';

describe('GIVEN utils/filterList', () => {
  const availableItems = ['Apple', 'Banana', 'Orange', 'Pear'];
  const additionalItems = ['Grapes', 'Kiwi'];
  const showedSuggestionsNumber = 3;

  it('filters the list when selectedItem is an empty string', () => {
    const selectedItem = '';
    const result = filterList({ selectedItem, availableItems, additionalItems, showedSuggestionsNumber });

    expect(result).toEqual(['Apple', 'Banana', 'Orange']);
  });

  it('filters the list when selectedItem is not an empty string', () => {
    const selectedItem = 'Ba';
    const result = filterList({ selectedItem, availableItems, additionalItems, showedSuggestionsNumber });

    expect(result).toEqual(['Banana']);
  });

  it('handles duplicates when selectedItem starts with "TT:: "', () => {
    const selectedItem = 'TT:: Test';
    const result = filterList({ selectedItem, availableItems, additionalItems, showedSuggestionsNumber });

    expect(result).toEqual([]);
  });

  it('handles duplicates when selectedItem starts with "JI:: "', () => {
    const selectedItem = 'JI:: Example';
    const result = filterList({ selectedItem, availableItems, additionalItems, showedSuggestionsNumber });

    expect(result).toEqual([]);
  });
});
