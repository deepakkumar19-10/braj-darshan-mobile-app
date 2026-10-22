import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, radii, shadows } from '../../theme';
import {
  AppText,
  AppHeader,
  SearchBar,
  EmptyState,
  SectionTag,
} from '../../components/common';
import EventCard from '../../components/cards/EventCard';
import eventsData from '../../data/events.json';

const EVENT_CATEGORIES_DATA = [
  { id: 'All', hi: 'सभी उत्सव', en: 'All Events' },
  { id: 'Spiritual Festival', hi: 'आध्यात्मिक पर्व', en: 'Festivals' },
  { id: 'Holi Celebration', hi: 'होली महोत्सव', en: 'Holi Events' },
  { id: 'Aarti & Raslila', hi: 'आरती व रासलीला', en: 'Aarti & Raslila' },
  { id: 'Parikrama', hi: 'पावन परिक्रमा', en: 'Parikrama' },
];

export default function EventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, isHindi } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const canGoBack = navigation.canGoBack();

  const filteredEvents = eventsData.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.titleEn?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.date?.includes(q) ||
      item.desc?.includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        title={isHindi ? 'ब्रज के पावन उत्सव व मेले' : 'Sacred Braj Festivals'}
        subtitle={
          isHindi
            ? 'वार्षिक धार्मिक पर्व व महामहोत्सव'
            : 'Annual Festivals & Celebrations'
        }
        showBack={canGoBack}
        onBack={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            isHindi
              ? 'जन्माष्टमी, होली, अन्नकूट या उत्सव खोजें...'
              : 'Search Janmashtami, Holi, Annakoot...'
          }
        />
      </View>

      {/* Category Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {EVENT_CATEGORIES_DATA.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <AppText
                  variant="caption"
                  weight="700"
                  color={isActive ? '#FFFFFF' : colors.text}
                >
                  {isHindi ? cat.hi : cat.en}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View
            style={[
              styles.headerBanner,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
                borderColor: isDark ? colors.border : colors.goldLight,
              },
              shadows.xs,
            ]}
          >
            <SectionTag text={isHindi ? '🎉 दिव्य उत्सव परंपरा' : '🎉 SACRED CELEBRATIONS'} />
            <AppText variant="h3" color={colors.navy} style={styles.bannerTitle}>
              {isHindi ? 'ब्रज की दिव्य उत्सव परंपरा' : 'Eternal Celebrations of Braj'}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {isHindi
                ? 'ब्रज में हर पर्व केवल उत्सव नहीं बल्कि भगवान श्रीकृष्ण और राधारानी की नित्य लीलाओं से जुड़ा अलौकिक आध्यात्मिक अनुभव है।'
                : 'In Braj, every festival is an immersion into the divine pastimes of Shri Radha Krishna.'}
            </AppText>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={isHindi ? 'कोई उत्सव नहीं मिला' : 'No Events Found'}
            description={
              isHindi
                ? 'कृपया अन्य श्रेणी चुनें अथवा दूसरा शब्द खोजें।'
                : 'Please select another category or search terms.'
            }
            actionTitle={isHindi ? 'सभी उत्सव देखें' : 'View All Events'}
            onAction={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  filterSection: {
    paddingVertical: spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  headerBanner: {
    borderRadius: radii.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  bannerTitle: {
    marginTop: spacing.xxs,
    marginBottom: 2,
  },
});
