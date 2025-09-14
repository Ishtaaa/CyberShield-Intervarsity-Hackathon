<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import gsap from 'gsap';

	// Import assets
	import dinoStationary from '$lib/assets/dino/dino-stationary.png';
	import dinoRun0 from '$lib/assets/dino/dino-run-0.png';
	import dinoRun1 from '$lib/assets/dino/dino-run-1.png';
	import dinoLose from '$lib/assets/dino/dino-lose.png';
	import cactus from '$lib/assets/dino/cactus.png';
	import ground from '$lib/assets/dino/ground.png';

	// Dino clone
	let worldEl: HTMLDivElement | null = null;
	let dinoEl: HTMLDivElement | null = null;
	let cactusEl: HTMLDivElement | null = null;

	let running = false;
	let gameOver = false;
	let score = 0;
	let hasPlayed = false;
	let isMobile = false;

	let timeoutId;
	const WORLD_W = 800;
	const WORLD_H = 300;

	// jump
	let dinoY = 0;
	let dinoVy = 0;
	const JUMP_V = 0.75; //  initial jump velocity
	const GRAVITY = 0.0016; // px

	// cactus
	let cactusX = WORLD_W;
	const CACTUS_W = 40;
	const BASE_SPEED = 0.5; // px per ms
	let speedScale = 1;

	// RAF loop
	let lastTime: number | null = null;
	let rafId: number | null = null;

	function startGame() {
		if (running || hasPlayed) return;
		running = true;
		hasPlayed = true;
		lastTime = null;
		rafId = requestAnimationFrame(update);
		worldEl?.focus();
	}

	function handleKey(e: KeyboardEvent) {
		if (!running && !gameOver && !hasPlayed) {
			startGame();
			return;
		}
		if (gameOver || !running) return;
		if (e.code === 'Space') {
			if (dinoY === 0) dinoVy = JUMP_V;
		}
	}

	function handleButtonJump() {
		if (gameOver || !running) return;
		if (dinoY === 0) dinoVy = JUMP_V;
	}

	function update(time: number) {
		if (!running) return;
		if (lastTime == null) {
			lastTime = time;
			rafId = requestAnimationFrame(update);
			return;
		}
		const delta = time - lastTime;
		lastTime = time;

		// dino

		dinoVy -= GRAVITY * delta; // gravity pulls down
		dinoY += dinoVy * delta; // apply velocity

		// ground barrier
		if (dinoY <= 0) {
			dinoY = 0;
			dinoVy = 0;
		}
		if (dinoEl) {
			dinoEl.style.transform = `translateY(${-dinoY}px)`;
		}

		// move cactus
		cactusX -= BASE_SPEED * speedScale * delta;
		if (cactusEl) cactusEl.style.transform = `translateX(${cactusX}px)`;

		// recycle cactus and increase difficulty slightly
		if (cactusX < -CACTUS_W) {
			cactusX = WORLD_W + 80 + Math.random() * 220;
			speedScale += 0.03;
		}

		// score
		score += delta * 0.01;

		// update dino animation
		updateDinoAnimation(delta);

		// collision
		if (dinoEl && cactusEl) {
			const a = dinoEl.getBoundingClientRect();
			const b = cactusEl.getBoundingClientRect();
			if (a.left < b.right && a.top < b.bottom && a.right > b.left && a.bottom > b.top) {
				handleLose();
				return;
			}
		}

		rafId = requestAnimationFrame(update);
	}

	function handleLose() {
		gameOver = true;
		running = false;
		dinoEl?.classList.add('dead');

		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		//  white noise effect: Used AI to refine and fix
		console.log('Game Over! Final Score:', Math.floor(score));
		showWhiteNoiseEffect();
	}

	function showWhiteNoiseEffect() {
		if (!browser) return;

		const canvas = document.createElement('canvas');
		canvas.style.position = 'fixed';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.width = '100vw';
		canvas.style.height = '100vh';
		canvas.style.zIndex = '10000';
		canvas.style.opacity = '0';
		canvas.style.filter = 'blur(1px)';
		document.body.appendChild(canvas);

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = (canvas.width = window.innerWidth);
		const height = (canvas.height = window.innerHeight);

		// Fade in white noise
		gsap.to(canvas, { opacity: 0.3, duration: 0.5, ease: 'power2.out' });

		// Create white noise animation - AI Generated
		let noiseId: number;
		function createNoise() {
			const imageData = ctx.createImageData(width, height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				const value = Math.random() < 0.5 ? 0 : 255;
				data[i] = value; // R
				data[i + 1] = value; // G
				data[i + 2] = value; // B
				data[i + 3] = 255; // A
			}

			ctx.putImageData(imageData, 0, 0);
			noiseId = requestAnimationFrame(createNoise);
		}

		createNoise();

		// Navigate after delay
		setTimeout(() => {
			cancelAnimationFrame(noiseId);
			gsap.to(canvas, {
				opacity: 0,
				duration: 0.5,
				ease: 'power2.in',
				onComplete: () => {
					document.body.removeChild(canvas);
					goto('/horror');
				}
			});
		}, 5000);
	}

	// Animation for dino running
	let dinoFrame = 0;
	let dinoFrameTime = 0;
	const DINO_FRAME_DURATION = 200; // ms per frame

	function updateDinoAnimation(delta: number) {
		if (!running || gameOver) return;

		dinoFrameTime += delta;
		if (dinoFrameTime >= DINO_FRAME_DURATION) {
			dinoFrame = (dinoFrame + 1) % 2;
			dinoFrameTime = 0;
		}
	}

	onMount(() => {
		if (browser) {
			// Check if device is mobile
			const userAgent = navigator.userAgent || navigator.vendor || window.opera;
			isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth <= 768;

			window.addEventListener('keydown', handleKey);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKey);
			if (rafId != null) cancelAnimationFrame(rafId);
		}
	});
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-200 to-green-200 p-8"
>
	{#if isMobile}
		<!-- Mobile Error Screen -->
		<div class="text-center max-w-md mx-auto p-6">
			<div class="mb-6">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mx-auto text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.046 18.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
				<h1 class="text-3xl font-bold text-red-700 mb-4">Desktop Only</h1>
			</div>

			<div class="bg-white rounded-lg p-6 shadow-lg border border-red-200">
				<h2 class="text-xl font-semibold text-gray-800 mb-3">🛡️ CyberShield Academy</h2>
				<p class="text-gray-600 mb-4">
					This cybersecurity training simulation requires a desktop computer for the full interactive experience.
				</p>

				<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<h3 class="font-semibold text-red-800 mb-2">Why Desktop Only?</h3>
					<ul class="text-sm text-red-700 space-y-1 text-left">
						<li>• Drag-and-drop window interactions</li>
						<li>• Keyboard shortcuts and commands</li>
						<li>• Multi-window desktop simulation</li>
						<li>• Professional cybersecurity tool interfaces</li>
					</ul>
				</div>

				<p class="text-gray-600 text-sm">
					Please access CyberShield Academy from a desktop or laptop computer to begin your cybersecurity training journey.
				</p>
			</div>
		</div>
	{:else}
		<!-- Regular Game Content -->
		<div class="text-center">
		<h1 class="mb-6 text-6xl font-bold text-gray-800">Dino Game</h1>
		<p class="mb-6 text-sm font-bold text-gray-800">(hint: wait a bit after you lose)</p>
		<p class="mb-4 text-2xl text-gray-700">
			Score: <span class="font-mono font-bold">{Math.floor(score)}</span>
		</p>
		<p class="mb-6 text-xl text-gray-600">Press Space to {running ? 'jump' : 'start'}</p>

		<div class="mb-6 flex justify-center gap-4">
			<button
				class="rounded-lg bg-black px-6 py-3 text-lg text-white hover:opacity-90 disabled:opacity-50"
				on:click={startGame}
				disabled={running || hasPlayed}
			>
				{hasPlayed ? 'Game Over' : 'Start Game'}
			</button>
			<button
				class="rounded-lg bg-gray-800 px-6 py-3 text-lg text-white hover:opacity-90 disabled:opacity-50"
				on:click={handleButtonJump}
				disabled={!running}
			>
				Jump
			</button>
		</div>

		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="relative mx-auto overflow-hidden rounded-xl border-4 border-gray-300 bg-white shadow-2xl"
			bind:this={worldEl}
			style="width: {WORLD_W}px; height: {WORLD_H}px; outline: none;"
			tabindex="0"
			aria-label="dino world"
		>
			<!-- sky / ground -->
			<div class="absolute right-0 bottom-0 left-0 h-12 bg-gray-900"></div>
			<img
				src={ground}
				alt="ground"
				class="absolute right-0 bottom-0 left-0 h-12 object-cover"
			/>

			<!-- dino -->
			<div
				bind:this={dinoEl}
				class="absolute bottom-12 left-20 h-16 w-20"
				style="transform: translateY(0); will-change: transform;"
				aria-hidden="true"
			>
				{#if gameOver}
					<img src={dinoLose} alt="dino dead" class="h-full w-full object-contain" />
				{:else if running}
					<img
						src={dinoFrame === 0 ? dinoRun0 : dinoRun1}
						alt="dino running"
						class="h-full w-full object-contain"
					/>
				{:else}
					<img
						src={dinoStationary}
						alt="dino stationary"
						class="h-full w-full object-contain"
					/>
				{/if}
			</div>

			<!-- cactus -->
			<div
				bind:this={cactusEl}
				class="absolute bottom-12 h-20 w-8"
				style="transform: translateX({cactusX}px); will-change: transform;"
				aria-hidden="true"
			>
				<img src={cactus} alt="cactus" class="h-full w-full object-contain" />
			</div>
		</div>

		{#if gameOver}
			<p class="mt-6 text-2xl font-bold text-red-600">
				Game Over! Final Score: {Math.floor(score)}
			</p>
		{/if}
		</div>
	{/if}
</div>
