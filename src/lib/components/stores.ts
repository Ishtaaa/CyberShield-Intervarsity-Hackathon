import { writable } from 'svelte/store';

// User progress and scoring
export const userXP = writable(0);
export const userLvl = writable(0);
