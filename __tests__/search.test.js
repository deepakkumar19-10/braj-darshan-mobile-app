import { searchTerms, searchFields } from '../src/utils/searchText';
import { normalizeSearch, matchesSearch } from '../src/components/ui';
import templesData from '../src/data/temples.json';

const find = (query) => {
  const terms = searchTerms(normalizeSearch(query));
  return templesData.filter((t) => {
    const fields = searchFields(t.name, t.nameHindi, t.city, t.cityHindi);
    return terms.every((term) => matchesSearch(term, ...fields));
  });
};

describe('Hindi spelling variants are found', () => {
  test('वृन्दावन (half न) finds the same temples as वृंदावन', () => {
    expect(find('वृन्दावन').length).toBeGreaterThan(0);
    expect(find('वृन्दावन').map((t) => t.id)).toEqual(find('वृंदावन').map((t) => t.id));
  });

  test('मन्दिर finds temples spelt मंदिर', () => {
    expect(find('मन्दिर').length).toBe(find('मंदिर').length);
    expect(find('मन्दिर').length).toBeGreaterThan(0);
  });

  test('every typed word must match: "banke vrindavan"', () => {
    const hits = find('banke vrindavan');
    expect(hits).toHaveLength(1);
    expect(hits[0].id).toBe(1);
  });
});
