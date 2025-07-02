export const formatDate = (dateString: string) => {
  const sessionDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (sessionDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (sessionDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return sessionDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

export const formatTime = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}`;
};