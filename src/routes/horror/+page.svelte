<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import anime from 'animejs';
  
    let display = '';
    const text =
      "Welcome, Operative. You have been chosen. Your mission begins now...";
    let i = 0;
  
    onMount(() => {
      // Typewriter 
      const interval = setInterval(() => {
        display += text[i];
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 40);
  
      // Glitch effect
      anime({
        targets: '.glitch',
        translateX: [
          { value: -2, duration: 80 },
          { value: 2, duration: 80 },
          { value: 0, duration: 80 },
        ],
        duration: 300,
        easing: 'easeInOutQuad',
        loop: true,
        direction: 'alternate',
      });
  
      // Scanline flicker
      anime({
        targets: '.scanlines',
        opacity: [
          { value: 0.15, duration: 120 },
          { value: 0.3, duration: 200 },
          { value: 0.25, duration: 150 },
        ],
        duration: 500,
        easing: 'linear',
        loop: true,
      });
    });
  
    function navigateToQuiz() {
      goto('/quiz');
    }
  </script>
  
  <style>
    
  </style>
  
  <div class="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
   
    <div
      class="scanlines absolute inset-0 pointer-events-none"
      style="background: repeating-linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.25),
        rgba(0, 0, 0, 0.25) 1px,
        transparent 1px,
        transparent 3px
      );"
    ></div>
  
    <h1
      class="glitch text-6xl sm:text-8xl font-bold mb-6 font-vt323 text-green-400 tracking-widest drop-shadow-lg"
    >
      WELCOME USER
    </h1>
  
    <!-- Typewriter -->
    <p
      class="text-green-300 font-vt323 text-lg sm:text-xl max-w-2xl text-center px-4 z-10"
    >
      {display}
    </p>
  
    <!-- Button -->
    <button
      on:click={navigateToQuiz}
      class="mt-10 px-6 py-3 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black rounded-lg font-vt323 text-lg transition-colors z-10"
    >
      Click to Begin
    </button>
  </div>
  