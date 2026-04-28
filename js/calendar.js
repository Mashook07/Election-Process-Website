// ============================================
// VoteGuide AI — Google Calendar Integration
// ============================================

export function createCalendarUrl(title, description, dateStr) {
  const date = new Date(dateStr);
  const startDate = date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const endDate = new Date(date.getTime() + 86400000).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}/${endDate}`,
    details: description + '\n\nAdded via VoteGuide AI — India\'s Election Education Platform',
    sf: 'true'
  });
  
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
