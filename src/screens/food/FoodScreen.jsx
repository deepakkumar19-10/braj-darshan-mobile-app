import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import {
  AppText,
  StitchHeader,
  StitchTag,
  StitchPill,
} from '../../components/common';
import { foodAssets } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';
import foodData from '../../data/food.json';

export default function FoodScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'sweets' | 'breakfast' | 'prasad'

  const filterTabs = [
    { id: 'all', label: isHindi ? 'सभी भोग (All)' : 'सभी भोग (All)' },
    { id: 'sweets', label: isHindi ? '🏛️ मिष्ठान एवं पेड़ा' : '🏛️ Sweets & Peda' },
    { id: 'breakfast', label: isHindi ? '🍲 प्रातः नाश्ता' : '🍲 Morning Nashta' },
    { id: 'prasad', label: isHindi ? '🍯 मंदिर महाप्रसाद' : '🍯 Temple Prasad' },
  ];

  const handleFindNearMe = (dishName, placeName) => {
    const query = encodeURIComponent(`${dishName} ${placeName} Braj`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleOpenFoodTrail = () => {
    Alert.alert(
      isHindi ? 'ब्रज फूड ट्रेल मैप' : 'Braj Food Trail Map',
      isHindi
        ? 'मथुरा होली गेट, विश्राम घाट एवं वृन्दावन बांके बिहारी बाज़ार की 30+ प्रमाणित शुद्ध देसी घी मिष्ठान दुकानों का नक्शा खोला जा रहा है।'
        : 'Opening certified map directions for 30+ pure desi ghee heritage sweet shops across Mathura & Vrindavan.',
      [
        {
          text: isHindi ? 'मैप्स खोलें' : 'Open Maps',
          onPress: () => {
            Linking.openURL('https://www.google.com/maps/search/?api=1&query=heritage+sweet+shops+Mathura+Vrindavan');
          },
        },
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Structured Food items matching Stitch exact designs
  const foodItems = [
    {
      id: 'food-1',
      tag: isHindi ? 'प्राचीन धरोहर मिष्ठान' : 'UNBROKEN HERITAGE SWEET',
      tagColor: '#B45309',
      tagBg: '#FEF3C7',
      image: foodAssets[1],
      rating: '★ 4.9 (1.2k Devotees)',
      price: '₹360 - 450/kg',
      title: isHindi ? 'मथुरा के पेड़े (Mathura Ke Pede)' : 'Mathura Ke Pede (मथुरा के पेड़े)',
      subtitle: isHindi ? 'प्रसिद्ध कैरामेलाइज्ड मावा मिष्ठान' : 'Iconic Caramelized Mawa Sweet',
      desc: isHindi
        ? 'धीमी आंच पर शुद्ध गाय के दूध के मावे को खांड व हरी इलायची के साथ भूनकर तैयार की गई सुनहरी परत वाली दिव्य मिठाई।'
        : 'Prepared by slow-roasting fresh cow milk mawa over wood fire with desi boora, fragrant green cardamom, and a rich golden brown crust.',
      shops: isHindi ? 'बृजवासी मिठाईवाला (होली गेट) • शंकर मिठाई' : 'Brijwasi Mithaiwala (Holi Gate) • Shankar Mithai',
      timing: isHindi ? 'ताज़ा बैच उपलब्ध: 07:30 AM से 09:30 PM' : 'Fresh batches ready: 07:30 AM to 09:30 PM',
      footerBadge: isHindi ? '🤍 मंदिर भोग: स्वीकृत' : '🤍 Temple Offering: Yes',
      category: 'sweets',
    },
    {
      id: 'food-2',
      tag: isHindi ? 'प्रातःकालीन पावन नाश्ता' : 'Morning Holy Breakfast',
      tagColor: '#C2410C',
      tagBg: '#FFEDD5',
      image: foodAssets[4],
      rating: '★ 4.8 (850 Devotees)',
      price: '₹40 - 60 /plate',
      title: isHindi ? 'हींग कचौड़ी एवं डुबकी वाले आलू' : 'Hing Kachori & Dubki Wale Aloo',
      subtitle: isHindi ? 'पारंपरिक प्रातः नाश्ता' : 'Traditional Morning Nashta',
      desc: isHindi
        ? 'उड़द दाल की खस्ता कचौड़ी के साथ हींग, अमचूर व हरी मिर्च से बघारी गई तीखी रसेदार आलू तरकारी, दोने में परोसी जाती है।'
        : 'Crispy flaky urad dal kachoris crushed into spicy hing-infused potato curry with tart amchoor and green chillies, traditionally served piping hot in an organic sal leaf dona.',
      shops: isHindi ? 'लाला कचौड़ी वाला (विश्राम घाट) • ओमा कचौड़ी, वृन्दावन' : 'Lala Kachori Wala (Vishram Ghat) • Oma Kachori, Vrindavan',
      timing: isHindi ? 'केवल 06:30 AM से 11:30 AM तक' : '06:30 AM to 11:30 AM only',
      footerBadge: isHindi ? '🍃 पत्तल दोने में गरमा-गरम' : '🍃 Served Hot in Sal Dona',
      category: 'breakfast',
    },
    {
      id: 'food-4',
      tag: isHindi ? 'शीतल पेय' : 'Chilled',
      tagColor: '#1D4ED8',
      tagBg: '#EFF6FF',
      image: foodAssets[6],
      rating: '★ 4.9',
      price: '₹50 - 70',
      title: isHindi ? 'कुल्हड़ मलाई लस्सी' : 'Kulhad Malai Lassi',
      subtitle: isHindi ? 'गाढ़े दही की झागदार मलाईदार लस्सी' : 'Thick Curd Froth with Rabri',
      desc: isHindi
        ? 'मिट्टी के कुल्हड़ में मथी गई गाढ़ी मलाईदार लस्सी, ऊपर से भरपूर लच्छेदार रबड़ी, केसर का अर्क और पिस्ता कतरन।'
        : 'Thick creamy curd whipped in earthen pots, crowned with generous rabdi, saffron syrup & crushed pistachios.',
      shops: isHindi ? 'गोली लस्सी, बांके बिहारी गली, वृन्दावन' : 'Goli Lassi, Banke Bihari Galli',
      timing: isHindi ? '08:00 AM से 10:30 PM' : '08:00 AM to 10:30 PM',
      footerBadge: isHindi ? '🍶 मिट्टी का कुल्हड़' : '🍶 Earthen Clay Pot',
      category: 'sweets',
    },
    {
      id: 'food-3',
      tag: isHindi ? 'दिव्य बाल भोग' : 'Sacred Bhog',
      tagColor: '#15803D',
      tagBg: '#DCFCE7',
      image: foodAssets[3],
      rating: '★ Supreme Ras',
      price: '₹30 - 50',
      title: isHindi ? 'माखन मिश्री महाप्रसाद' : 'Makhan Mishri Prasad',
      subtitle: isHindi ? 'बाल गोपाल का परम प्रिय भोग' : "Bala Gopal's Favorite Delight",
      desc: isHindi
        ? 'हाथ से मथा हुआ ताजा सफेद मक्खन, दानेदार मिश्री और श्यामा तुलसी दल से सुशोभित शुद्ध वैष्णव महाप्रसाद।'
        : 'Freshly hand-churned unsalted white butter blended with crystal mishri and fresh Shyam Tulsi leaf.',
      shops: isHindi ? 'निधिवन एवं सेवा कुंज गली के अधिकृत स्टॉल' : 'Nidhivan & Seva Kunj Gali',
      timing: isHindi ? 'प्रातः मंगला से रात्रि शयन तक' : 'Mangala to Shayan Aarti',
      footerBadge: isHindi ? '🌿 पवित्र तुलसी दल सहित' : '🌿 With Shyam Tulsi',
      category: 'prasad',
    },
  ];

  const displayedFoods = foodItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Stitch Standard Header */}
      <StitchHeader
        title={isHindi ? 'श्री ब्रज दर्शन' : 'Shri Braj Darshan'}
        subtitle={isHindi ? 'मथुरा • वृन्दावन • गोवर्धन' : 'Mathura • Vrindavan • Govardhan'}
        wishlistCount={favorites.length}
        onWishlistPress={() => navigation.navigate(ROUTES.FAVORITES)}
        onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Top Tag & Title */}
        <View style={styles.titleSection}>
          <StitchTag
            text={isHindi ? '🛕 प्रामाणिक ब्रज प्रसाद व भोग' : 'AUTHENTIC PRASAD & BHOG'}
            color="#C2410C"
            backgroundColor="#FFEDD5"
          />
          <AppText variant="h1" color={colors.navy} style={styles.mainTitle}>
            {isHindi ? 'स्वाद भी, भक्ति भी' : 'Where Flavour Meets Faith'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.descText}>
            {isHindi
              ? 'स्वाद भी, भक्ति भी — authentic temple delicacies, morning street breakfast & revered temple prasad across Mathura & Vrindavan.'
              : 'Authentic temple delicacies, morning street breakfast & revered temple prasad across Mathura & Vrindavan.'}
          </AppText>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <StitchPill
                key={tab.id}
                label={tab.label}
                selected={isSelected}
                onPress={() => setSelectedFilter(tab.id)}
              />
            );
          })}
        </ScrollView>

        {/* Satvik Assurance Strip */}
        <View
          style={[
            styles.satvikAssuranceStrip,
            { backgroundColor: isDark ? colors.cardAlt : '#F0FDF4', borderColor: '#BBF7D0' },
          ]}
        >
          <AppText variant="micro" weight="700" color="#15803D">
            🌱 {isHindi ? '100% शुद्ध सात्विक' : 'Pure Satvik'} • 100% {isHindi ? 'शुद्ध देसी घी' : 'Shuddh Desi Ghee'} • {isHindi ? 'बिना प्याज-लहसुन' : 'No Garlic / Onion'}
          </AppText>
        </View>

        {/* Food Dish Cards */}
        {displayedFoods.map((dish) => {
          const favorited = isFavorite(dish.id);
          return (
            <View
              key={dish.id}
              style={[
                styles.foodCard,
                {
                  backgroundColor: isDark ? colors.card : '#FFFFFF',
                  borderColor: isDark ? colors.border : '#E5E7EB',
                },
              ]}
            >
              {/* Photo with Overlays */}
              <View style={styles.cardImageContainer}>
                <Image
                  source={dish.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={[styles.dishTagBadge, { backgroundColor: dish.tagBg }]}>
                  <AppText variant="micro" weight="800" color={dish.tagColor}>
                    {dish.tag}
                  </AppText>
                </View>

                <TouchableOpacity
                  style={styles.favBtn}
                  onPress={() => toggleFavorite(dish.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <AppText variant="body" color={favorited ? '#DC2626' : '#FFFFFF'}>
                    {favorited ? '❤️' : '🤍'}
                  </AppText>
                </TouchableOpacity>

                <View style={styles.imageBottomRow}>
                  <View style={styles.ratingBadge}>
                    <AppText variant="micro" weight="700" color="#FFFFFF">
                      {dish.rating}
                    </AppText>
                  </View>
                  <View style={styles.priceBadge}>
                    <AppText variant="micro" weight="800" color="#FFFFFF">
                      {dish.price}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <AppText variant="h2" color={colors.navy} style={styles.dishTitle}>
                  {dish.title}
                </AppText>
                <AppText variant="micro" weight="700" color={colors.primary} style={styles.dishSubtitle}>
                  {dish.subtitle}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} style={styles.dishDesc}>
                  {dish.desc}
                </AppText>

                {/* Info Tiles */}
                <View
                  style={[
                    styles.shopInfoBox,
                    { backgroundColor: isDark ? colors.cardAlt : '#F8FAFC', borderColor: isDark ? colors.border : '#E2E8F0' },
                  ]}
                >
                  <View style={styles.infoRow}>
                    <AppText variant="micro" color={colors.navy}>
                      🏪 <AppText variant="micro" weight="700" color={colors.navy}>{dish.shops}</AppText>
                    </AppText>
                  </View>
                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <AppText variant="micro" color={colors.textSecondary}>
                      🕐 {dish.timing}
                    </AppText>
                  </View>
                </View>

                {/* Footer Action Row */}
                <View style={styles.cardFooterRow}>
                  <AppText variant="micro" weight="600" color={colors.textSecondary}>
                    {dish.footerBadge}
                  </AppText>
                  <TouchableOpacity
                    style={[styles.findNearBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleFindNearMe(dish.title, 'Mathura')}
                    activeOpacity={0.85}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <AppText variant="micro" weight="800" color="#FFFFFF">
                      📍 {isHindi ? 'निकटतम खोजें' : 'Find Near Me'}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Satvik & Vaishnav Dining Etiquette Card */}
        <View
          style={[
            styles.etiquetteCard,
            {
              backgroundColor: isDark ? colors.cardAlt : '#FFF7ED',
              borderColor: '#FED7AA',
            },
          ]}
        >
          <View style={styles.etiquetteHeader}>
            <AppText variant="body" color="#EA580C">
              🍽️
            </AppText>
            <AppText variant="body" weight="700" color={colors.navy} style={{ marginLeft: 8 }}>
              {isHindi ? 'सात्विक एवं वैष्णव खान-पान मर्यादा' : 'Satvik & Vaishnav Dining Etiquette'}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={styles.etiquetteText}>
            {isHindi
              ? 'वृन्दावन, गोवर्धन और पावन यमुना घाटों के पारंपरिक भोजनालय पूरी तरह से बिना प्याज व बिना लहसुन (No Pyaaz, No Lahsun) के शुद्ध भोजन तैयार करते हैं। दुकानों पर 100% शुद्ध देसी घी का प्रमाण पत्र अवश्य देखें।'
              : 'Traditional eateries in Vrindavan, Govardhan, and holy Yamuna ghats prepare culinary treats strictly without onion and garlic (No Pyaaz, No Lahsun). Look for the "100% Shuddh Desi Ghee" certification seal on sweet shop counters.'}
          </AppText>

          <View style={styles.etiquettePillsRow}>
            <View style={[styles.etiquettePill, { backgroundColor: '#DCFCE7' }]}>
              <AppText variant="micro" weight="700" color="#15803D">
                🌱 {isHindi ? 'फलाहारी/व्रत उपलब्ध' : "Ask for 'Vrat' (Falahari)"}
              </AppText>
            </View>
            <View style={[styles.etiquettePill, { backgroundColor: '#FEF3C7' }]}>
              <AppText variant="micro" weight="700" color="#B45309">
                🥛 {isHindi ? 'तामसिक तेल वर्जित' : 'Tamasic oils bypassed'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Interactive Map Directory CTA Card */}
        <View style={[styles.trailBannerCard, { backgroundColor: colors.primary }]}>
          <View style={styles.trailHeader}>
            <View style={styles.trailIconBox}>
              <AppText variant="h2" color="#FFFFFF">
                🗺️
              </AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="micro" weight="800" color="#FEF3C7">
                {isHindi ? 'इंटरैक्टिव मैप डायरेक्टरी' : 'INTERACTIVE MAP DIRECTORY'}
              </AppText>
              <AppText variant="h2" weight="800" color="#FFFFFF" style={{ marginTop: 2 }}>
                {isHindi ? '30+ प्रमाणित ब्रज मिष्ठान दुकानें' : 'Explore 30+ Verified Braj Heritage Sweet Shops'}
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color="#FFEDD5" style={styles.trailDesc}>
            {isHindi
              ? 'होली गेट मथुरा, विश्राम घाट एवं बांके बिहारी बाज़ार की संकरी गलियों में पैदल मार्गदर्शिका एवं दुकान के खुलने-बंद होने का सत्यापित समय।'
              : 'Navigate narrow alleys of Holi Gate Mathura, Vishram Ghat & Banke Bihari bazaar with walking directions and certified shop hours.'}
          </AppText>

          <TouchableOpacity
            style={styles.openTrailBtn}
            onPress={handleOpenFoodTrail}
            activeOpacity={0.85}
          >
            <AppText variant="caption" weight="800" color={colors.primary}>
              {isHindi ? 'ब्रज फूड ट्रेल मैप खोलें →' : 'Open Braj Food Trail Map →'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  titleSection: {
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: 8,
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
  },
  filterPillsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  satvikAssuranceStrip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  foodCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  dishTagBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceBadge: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBody: {
    padding: 16,
  },
  dishTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 2,
  },
  dishSubtitle: {
    fontSize: 12,
    marginBottom: 6,
  },
  dishDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  shopInfoBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  findNearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  etiquetteCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  etiquetteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  etiquetteText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  etiquettePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  etiquettePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trailBannerCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  trailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trailIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  openTrailBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
