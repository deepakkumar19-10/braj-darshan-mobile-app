/**
 * Utility to calculate real-time temple darshan status (Open / Closed / Aarti).
 * In Braj temples, darshan is generally split into:
 * - Morning (प्रातः दर्शन): ~07:30 AM to ~12:30 PM
 * - Afternoon Vishram (दोपहर विश्राम/पट बंद): ~12:30 PM to ~04:30 PM
 * - Evening (संध्या दर्शन): ~04:30 PM to ~09:30 PM
 * - Night Shayan (रात्रि शयन): ~09:30 PM to ~07:30 AM
 */

export function getTempleStatus(temple, now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Approximate Braj general timings in minutes from midnight
  const morningOpen = 7 * 60 + 30; // 07:30 AM
  const morningClose = 12 * 60 + 30; // 12:30 PM
  const eveningOpen = 16 * 60 + 30; // 04:30 PM
  const eveningClose = 21 * 60 + 30; // 09:30 PM

  if (currentMinutes >= morningOpen && currentMinutes < morningClose) {
    return {
      isOpen: true,
      label: '🟢 दर्शन खुला है (Open)',
      variant: 'success',
      hint: 'दोपहर 12:30 बजे राजभोग उपरांत पट बंद होंगे',
    };
  } else if (currentMinutes >= morningClose && currentMinutes < eveningOpen) {
    return {
      isOpen: false,
      label: '🔴 विश्राम काल (पट बंद)',
      variant: 'warning',
      hint: 'संध्या दर्शन 04:30 PM से पुनः प्रारंभ होंगे',
    };
  } else if (currentMinutes >= eveningOpen && currentMinutes < eveningClose) {
    return {
      isOpen: true,
      label: '🟢 संध्या दर्शन खुला है',
      variant: 'success',
      hint: 'रात्रि 09:30 बजे शयन आरती उपरांत पट बंद होंगे',
    };
  } else {
    return {
      isOpen: false,
      label: '🌙 रात्रि शयन (पट बंद)',
      variant: 'purple',
      hint: 'प्रातः 07:30 बजे मंगला व श्रृंगार दर्शन प्रारंभ होंगे',
    };
  }
}
