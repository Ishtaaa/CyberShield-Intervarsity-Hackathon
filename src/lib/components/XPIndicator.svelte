<script lang="ts">
    import { currentLevel, levelXP } from '$lib/components/storyStore';
    $: level = $currentLevel;
    $: xp = $levelXP;
  </script>
  
  <div class="fixed top-4 right-4 z-50 bg-white/80 rounded-lg shadow px-4 py-2 flex flex-col items-center">
    <div class="text-xs text-gray-600 font-semibold">LEVEL</div>
    <div class="text-2xl font-bold text-gray-800">{level}</div>
    <div class="text-xs text-gray-500">{xp}/100 XP</div>
  </div>