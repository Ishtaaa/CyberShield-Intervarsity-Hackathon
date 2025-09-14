import { writable } from 'svelte/store';


//AI was used for parts of story progression guidance
// Story stages
export const STAGES = {
  INTRO: 0,
  PHISHING_EMAIL: 1,
  GOBUSTER_SCAN: 2,
  PASSWORD_CRACK: 3,
  COMPLETE: 4
};

export const currentStage = writable(STAGES.INTRO);

export const currentLevel = writable(1);
export const levelXP = writable(0); // XP for current level (0-100)

// Email categorization tracking
export const categorizedEmails = writable<Set<number>>(new Set());
export const totalEmails = writable(4); // Total number of emails to categorize

export function addXP(amount: number) {
  levelXP.update(xp => {
    const newXP = xp + amount;
    if (newXP >= 100) {
      currentLevel.update(level => level + 1);
      return newXP - 100; // Carry over excess XP
    }
    return newXP;
  });
}

export function progressStory() {
  console.log('progressStory called!');
  currentStage.update(stage => {
    console.log('Current stage:', stage, 'Moving to:', stage + 1);
    if (stage < STAGES.COMPLETE) {
      return stage + 1;
    }
    return stage;
  });
}

// Track email categorization
export function categorizeEmail(emailId: number) {
  console.log('Categorizing email:', emailId);
  categorizedEmails.update(emails => {
    const newSet = new Set(emails);
    newSet.add(emailId);
    console.log('Total categorized emails:', newSet.size);
    return newSet;
  });
}

// Check if all emails are categorized
export function areAllEmailsCategorized(): boolean {
  let categorized: Set<number> = new Set();
  let total: number = 0;
  
  const unsubscribeCategorized = categorizedEmails.subscribe(value => categorized = value);
  const unsubscribeTotal = totalEmails.subscribe(value => total = value);
  
  unsubscribeCategorized();
  unsubscribeTotal();
  
  return categorized.size >= total;
}

// Reset email tracking for new stage
export function resetEmailTracking() {
  categorizedEmails.set(new Set());
}