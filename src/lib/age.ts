import { differenceInMonths, differenceInYears, differenceInDays } from 'date-fns';

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
}

export function calculateAge(birthdate: Date | string): AgeResult {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  const now = new Date();

  const totalMonths = differenceInMonths(now, birth);
  const years = differenceInYears(now, birth);
  
  // Calculate remaining months after full years
  const afterYears = new Date(birth);
  afterYears.setFullYear(afterYears.getFullYear() + years);
  const months = differenceInMonths(now, afterYears);
  
  // Calculate remaining days after full months
  const afterMonths = new Date(afterYears);
  afterMonths.setMonth(afterMonths.getMonth() + months);
  const days = differenceInDays(now, afterMonths);

  return {
    years,
    months,
    days,
    totalMonths,
  };
}

export function formatAge(birthdate: Date | string): string {
  const age = calculateAge(birthdate);
  
  if (age.years === 0) {
    if (age.months === 0) {
      return `${age.days} day${age.days !== 1 ? 's' : ''} old`;
    }
    return `${age.months} month${age.months !== 1 ? 's' : ''} old`;
  }
  
  if (age.months === 0) {
    return `${age.years} year${age.years !== 1 ? 's' : ''} old`;
  }
  
  return `${age.years} year${age.years !== 1 ? 's' : ''}, ${age.months} month${age.months !== 1 ? 's' : ''} old`;
}

export function formatAgeRange(minMonths: number, maxMonths: number): string {
  const formatMonths = (months: number) => {
    if (months < 12) {
      return `${months}mo`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years}yr`;
    }
    return `${years}yr ${remainingMonths}mo`;
  };

  return `${formatMonths(minMonths)} - ${formatMonths(maxMonths)}`;
}
