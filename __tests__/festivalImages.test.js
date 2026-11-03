import { getFestivalImage, getFestivalIcon } from '../src/utils/festivalImages';
import { YEAR_FESTIVALS_MAP } from '../src/services/panchangService';

describe('festival photos', () => {
  test('each festival gets its own photo, matched in English or Hindi', () => {
    const govardhan = getFestivalImage({ nameEn: 'Govardhan Puja & Annakoot' });
    const holi = getFestivalImage({ nameHi: 'बरसाना लट्ठमार होली' });
    const janmashtami = getFestivalImage({ nameEn: 'Shri Krishna Janmashtami (Supreme Advent)' });
    expect(govardhan).toBeTruthy();
    expect(holi).toBeTruthy();
    expect(janmashtami).toBeTruthy();
    expect(new Set([govardhan, holi, janmashtami]).size).toBe(3);
  });

  test('Phoolon wali Holi gets its own photo, not the Lathmar one', () => {
    expect(getFestivalImage({ nameEn: 'Phoolon wali Holi' })).not.toBe(
      getFestivalImage({ nameEn: 'Barsana Lathmar Holi' })
    );
  });

  test('Deepawali, Bhai Dooj, Gopashtami and Tulsi Vivah each get their own photo', () => {
    const photos = [
      getFestivalImage({ nameEn: 'Deepawali (Festival of Lights)', nameHi: 'दीपावली' }),
      getFestivalImage({ nameEn: 'Yama Dwitiya (Bhai Dooj Snan)' }),
      getFestivalImage({ nameEn: 'Gopashtami (Gau Mata Puja)' }),
      getFestivalImage({ nameEn: 'Devutthana Ekadashi (Tulsi Vivah)' }),
    ];
    photos.forEach((p) => expect(p).toBeTruthy());
    expect(new Set(photos).size).toBe(4);
  });

  test('no photo rather than an unrelated one', () => {
    expect(getFestivalImage({ nameEn: 'Maha Shivratri', nameHi: 'महाशिवरात्रि' })).toBeNull();
    expect(getFestivalImage(null)).toBeNull();
  });

  test('cards without a photo get a fitting icon', () => {
    expect(getFestivalIcon({ nameEn: 'Deepawali (Festival of Lights)' })).toBe('aarti');
    expect(getFestivalIcon({ nameEn: 'Maha Shivratri' })).toBe('festival');
  });

  test('works on every festival in the app calendar without throwing', () => {
    Object.values(YEAR_FESTIVALS_MAP).forEach((f) => {
      expect(() => getFestivalImage(f)).not.toThrow();
    });
  });
});
