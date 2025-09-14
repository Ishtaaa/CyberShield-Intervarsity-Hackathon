<script lang="ts">
	import { onMount } from 'svelte';
	import { draggable } from '$lib/components/draggable';
	import { userXP } from '$lib/components/stores';
	import { currentStage, STAGES, currentLevel, levelXP, addXP, resetEmailTracking, progressStory } from '$lib/components/storyStore';

	// Add XPIndicator
	import XPIndicator from '$lib/components/XPIndicator.svelte';
	// Add MailWindow
	import MailWindow from '$lib/components/MailWindow.svelte';
	// Add BrowserWindow
	import BrowserWindow from '$lib/components/BrowserWindow.svelte';

	let intro = true;
	let showPhone = false;
	let showMail = false;
	let showBrowser = false;
	let showMiniGame = false;
	let showStartupAlert = true;
	let step = 0;
	let score = $userXP;
	let alerts = [];
	let objectiveIndex = 0;
	let selectedMessage: number | null = null;
	let passwordInput = '';
	let passwordStrength = '';
	let passwordFeedback = '';
	let passwordScore = 0;

	$: phoneMessages = getPhoneMessages($currentStage);
	
	// Handle stage progression - reset email tracking when moving to GOBUSTER_SCAN
	$: if ($currentStage === STAGES.GOBUSTER_SCAN) {
		// Reset email tracking for next stage
		resetEmailTracking();
	}


	function getPhoneMessages(stage: number) {
		const messages = [
			{
				id: 1,
				sender: "Boss",
				preview: "🚨 Dr. Phish Attack!",
				fullMessage: "Welcome to the Cyber-Village Defense Squad! 🛡️ Lily from SweetBytes Bakery needs our help. She received a suspicious email from 'CyberBank' demanding she reset her password immediately. But here's the thing - she never signed up for CyberBank! The villain Dr. Phish is trying to steal her credentials. Your mission: Open the Email app and analyze the message. Look for red flags like suspicious domains, urgent language, and spelling errors. Help Lily learn to spot phishing attempts!",
				time: "2:45 PM",
				unread: stage === STAGES.INTRO
			}
		];

		// Add completion message 
		if (stage >= STAGES.GOBUSTER_SCAN) {
			messages.push({
				id: 1.5,
				sender: "Boss",
				preview: "🎉 Email Mission Complete!",
				fullMessage: "Outstanding work, Operative! You've successfully categorized all the emails and helped Lily learn to identify phishing attempts. She now knows to look for suspicious domains, urgent language, and spelling errors. Your cybersecurity training is paying off! Ready for the next challenge?",
				time: "3:00 PM",
				unread: false
			});
		}

		if (stage >= STAGES.GOBUSTER_SCAN) {
			// First, introduce Gorb the goblin
			messages.push({
				id: 2,
				sender: "Gorb 🧌",
				preview: "👋 Hey there, Cyber Defender!",
				fullMessage: "Greetings, human! I'm Gorb, your friendly neighborhood goblin hacker! 🧌✨ I've been watching your progress with the phishing emails - excellent work! Now, let me introduce you to my favorite tool: Gobuster! It's like a magical scanner that finds hidden doors (directories) on websites. Think of it as a treasure map for finding secret admin panels that shouldn't be public! Ready to learn some real hacker techniques?",
				time: "3:10 PM",
				unread: stage === STAGES.GOBUSTER_SCAN
			});
			
			// Then the actual mission
			messages.push({
				id: 2.5,
				sender: "Boss",
				preview: "🕷️ Gorb's Gobuster Mission",
				fullMessage: "Perfect! Gorb has introduced you to directory scanning. Now here's your mission: Dr. Phish might have already compromised Lily's website. Use Gorb's Gobuster tool to scan sweetbytes.local and find hidden admin pages. Look for directories like /admin that shouldn't be publicly accessible. This teaches us how attackers discover vulnerabilities! Open the Browser app and let's hunt for those hidden doors!",
				time: "3:15 PM",
				unread: false
			});
		}

		// Add gobuster completion message
		if (stage >= STAGES.PASSWORD_CRACK) {
			messages.push({
				id: 2.8,
				sender: "Gorb 🧌",
				preview: "🎉 Gobuster Mission Complete!",
				fullMessage: "Fantastic work, human! You've successfully used Gobuster to find those hidden directories! 🧌✨ You discovered the /admin panel that shouldn't be public - this is exactly how real attackers find vulnerabilities. Now you understand why web developers need to secure their admin panels! Ready for the final challenge?",
				time: "3:40 PM",
				unread: false
			});
			
			messages.push({
				id: 3,
				sender: "Boss",
				preview: "🔓 Final Challenge: Password Security",
				fullMessage: "Excellent work with Gorb's Gobuster tool! You found the exposed admin panel - now here's the final challenge: The villain 'Hydra-Hack' is trying to break in using brute-force attacks. Your mission: Test the login form with common weak passwords like 'admin', 'password', or 'sweetbaker123'. This will show you how easily attackers can break weak passwords. Then help Lily understand why strong passwords and 2FA are crucial for protection!",
				time: "3:45 PM",
				unread: stage === STAGES.PASSWORD_CRACK
			});
		}

		// Add final completion message
		if (stage >= STAGES.COMPLETE) {
			messages.push({
				id: 4,
				sender: "Boss",
				preview: "🏆 Mission Complete!",
				fullMessage: "🎉 CONGRATULATIONS, CYBER DEFENDER! 🎉 You've successfully completed all challenges! You've learned to identify phishing emails, use directory scanning tools like Gobuster, and understand password security. Lily's bakery is now safe from Dr. Phish and his villainous friends! You're now a certified member of the Cyber-Village Defense Squad! 🛡️✨",
				time: "4:00 PM",
				unread: false
			});
		}

		return messages;
	}

	let width = 800;
	let height = 600;
	let phonePos = { x: 100, y: 200 };
	let browserPos = { x: 250, y: 250 };
	let mailPos ={x:200,y:150};
	let miniPos = { x: 420, y: 160 };

	onMount(() => {
		width = window.innerWidth;
		height = window.innerHeight;

		const handleResize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
		};
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	});
	function handleMessageClick(index: number) {
		selectedMessage = index;
		phoneMessages[index].unread = false;
	}

	function goBackToInbox() {
		selectedMessage = null;
	}
	function checkPassword() {
		if (!passwordInput) {
			passwordStrength = '';
			passwordFeedback = '';
			passwordScore = 0;
			return;
		}

		passwordScore = 0;
		let feedback = [];
		let issues = [];

		// Length check
		if (passwordInput.length >= 12) {
			passwordScore += 2;
			feedback.push("✅ Good length (12+ characters)");
		} else if (passwordInput.length >= 8) {
			passwordScore += 1;
			feedback.push("⚠️ Okay length (8+ characters)");
		} else {
			issues.push("❌ Too short (needs 8+ characters)");
		}

		// Uppercase check
		if (/[A-Z]/.test(passwordInput)) {
			passwordScore += 1;
			feedback.push("✅ Contains uppercase letters");
		} else {
			issues.push("❌ Add uppercase letters");
		}

		// Lowercase check
		if (/[a-z]/.test(passwordInput)) {
			passwordScore += 1;
			feedback.push("✅ Contains lowercase letters");
		} else {
			issues.push("❌ Add lowercase letters");
		}

		// Numbers check
		if (/[0-9]/.test(passwordInput)) {
			passwordScore += 1;
			feedback.push("✅ Contains numbers");
		} else {
			issues.push("❌ Add numbers");
		}

		// Special characters check
		if (/[^A-Za-z0-9]/.test(passwordInput)) {
			passwordScore += 1;
			feedback.push("✅ Contains special characters");
		} else {
			issues.push("❌ Add special characters (!@#$%^&*)");
		}

		// Common password check
		const commonPasswords = ["password", "123456", "admin", "qwerty", "letmein", "welcome", "monkey", "dragon"];
		if (commonPasswords.some(common => passwordInput.toLowerCase().includes(common))) {
			passwordScore = Math.max(0, passwordScore - 2);
			issues.push("❌ Contains common password patterns");
		}

		// Dictionary word check (basic)
		const commonWords = ["password", "admin", "user", "login", "welcome", "secret", "test", "guest"];
		if (commonWords.some(word => passwordInput.toLowerCase().includes(word))) {
			passwordScore = Math.max(0, passwordScore - 1);
			issues.push("❌ Avoid common dictionary words");
		}

		// Set strength based on score
		if (passwordScore <= 1) {
			passwordStrength = "Very Weak 💀";
			addXP(2);
		} else if (passwordScore <= 2) {
			passwordStrength = "Weak 😟";
			addXP(3);
		} else if (passwordScore <= 3) {
			passwordStrength = "Medium ⚠️";
			addXP(5);
		} else if (passwordScore <= 4) {
			passwordStrength = "Strong 💪";
			addXP(8);
		} else {
			passwordStrength = "Very Strong 🛡️";
			addXP(10);
		}

		// Combine feedback
		passwordFeedback = [...feedback, ...issues].join('\n');
	}
	function closeStartupAlert() {
		showStartupAlert = false;
		selectedMessage=null;
	}
</script>

<!-- Add XPIndicator to the top right -->
<XPIndicator />

<div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-400 via-green-600 to-indigo-900">
	<div class="pointer-events-none absolute inset-0 opacity-25">
		<svg
			class="h-full w-full"
			width="100%"
			height="100%"
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<path
						d="M 40 0 L 0 0 0 40"
						fill="none"
						stroke="currentColor"
						stroke-width="0.5"
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#grid)" class="text-secondary/40" />
		</svg>
	</div>

	{#if showStartupAlert}
		<div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
			<div class="alert alert-info shadow-lg max-w-md">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<span>Open your phone for first assignment.</span>
				<button class="btn btn-sm btn-ghost" on:click={closeStartupAlert}>✕</button>
			</div>
		</div>
	{/if}

	<div class="absolute flex flex-col gap-2 p-10 text-lg text-white">
		<button
			aria-label="Phone"
			class="btn transition-all duration-300 ease-in-out btn-lg hover:scale-105 hover:bg-blue-700"
			on:click={() => {
				showPhone = !showPhone;
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<rect width="24" height="24" fill="none" />
				<path
					fill="#fff"
					d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"
				/>
			</svg>
		</button>
		<button
			aria-label="Browser"
			class="btn transition-all duration-300 ease-in-out btn-lg hover:scale-105 hover:bg-blue-700"
			on:click={() => {
				showBrowser = !showBrowser;
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<rect width="24" height="24" fill="none" />
				<path
					fill="#fff"
					d="M3.441 9.956a4.926 4.926 0 0 0 6.233 7.571l4.256 4.257a.773.773 0 0 0 1.169-1.007l-.075-.087l-4.217-4.218A4.927 4.927 0 0 0 3.44 9.956m13.213 6.545c-.225 1.287-.548 2.456-.952 3.454l.03.028l.124.14c.22.295.344.624.378.952a10.03 10.03 0 0 0 4.726-4.574zM12.25 16.5l2.284 2.287c.202-.6.381-1.268.53-1.992l.057-.294zm-2.936-5.45a3.38 3.38 0 1 1-4.78 4.779a3.38 3.38 0 0 1 4.78-4.78M15.45 10h-3.7a5.94 5.94 0 0 1 .892 5h2.71a26 26 0 0 0 .132-4.512zm1.507 0a28 28 0 0 1-.033 4.42l-.057.58h4.703a10.05 10.05 0 0 0 .258-5zm-2.095-7.593c.881 1.35 1.536 3.329 1.883 5.654l.062.44h4.59a10.03 10.03 0 0 0-6.109-5.958l-.304-.1zm-2.836-.405c-1.277 0-2.561 2.382-3.158 5.839c.465.16.912.38 1.331.658l5.088.001c-.54-3.809-1.905-6.498-3.261-6.498m-2.837.405A10.03 10.03 0 0 0 2.654 8.5h.995a5.92 5.92 0 0 1 3.743-.968c.322-1.858.846-3.47 1.527-4.68l.162-.275z"
				/>
			</svg>
		</button>
		<button
			aria-label="Mail"
			class="btn transition-all duration-300 ease-in-out btn-lg hover:scale-105 hover:bg-blue-700"
			on:click={() => {
				showMail = !showMail;
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<rect width="24" height="24" fill="none" />
				<path fill="#fff" fill-opacity="0" d="M12 11l-8 -5h16l-8 5Z">
					<animate
						fill="freeze"
						attributeName="fill-opacity"
						begin="2.4s"
						dur="1.5s"
						values="0;1"
					/>
				</path>
				<g
					fill="none"
					stroke="#fff"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.1"
				>
					<path
						stroke-dasharray="64"
						stroke-dashoffset="64"
						d="M4 5h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-12c0 -0.55 0.45 -1 1 -1Z"
					>
						<animate
							fill="freeze"
							attributeName="stroke-dashoffset"
							dur="1.8s"
							values="64;0"
						/>
					</path>
					<path stroke-dasharray="24" stroke-dashoffset="24" d="M3 6.5l9 5.5l9 -5.5">
						<animate
							fill="freeze"
							attributeName="stroke-dashoffset"
							begin="1.8s"
							dur="0.6s"
							values="24;0"
						/>
					</path>
				</g>
			</svg>
		</button>
		<button
			aria-label="minigames"
			class="btn transition-all duration-300 ease-in-out btn-lg hover:scale-105 hover:bg-blue-700"
			on:click={() => {
				showMiniGame = !showMiniGame;
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
				<rect width="512" height="512" fill="none" />
				<path
					fill="#fff"
					d="M483.13 245.38C461.92 149.49 430 98.31 382.65 84.33A107.1 107.1 0 0 0 352 80c-13.71 0-25.65 3.34-38.28 6.88C298.5 91.15 281.21 96 256 96s-42.51-4.84-57.76-9.11C185.6 83.34 173.67 80 160 80a115.7 115.7 0 0 0-31.73 4.32c-47.1 13.92-79 65.08-100.52 161C4.61 348.54 16 413.71 59.69 428.83a56.6 56.6 0 0 0 18.64 3.22c29.93 0 53.93-24.93 70.33-45.34c18.53-23.1 40.22-34.82 107.34-34.82c59.95 0 84.76 8.13 106.19 34.82c13.47 16.78 26.2 28.52 38.9 35.91c16.89 9.82 33.77 12 50.16 6.37c25.82-8.81 40.62-32.1 44-69.24c2.57-28.48-1.39-65.89-12.12-114.37M208 240h-32v32a16 16 0 0 1-32 0v-32h-32a16 16 0 0 1 0-32h32v-32a16 16 0 0 1 32 0v32h32a16 16 0 0 1 0 32m84 4a20 20 0 1 1 20-20a20 20 0 0 1-20 20m44 44a20 20 0 1 1 20-19.95A20 20 0 0 1 336 288m0-88a20 20 0 1 1 20-20a20 20 0 0 1-20 20m44 44a20 20 0 1 1 20-20a20 20 0 0 1-20 20"
				/>
			</svg>
		</button>
	</div>

	{#if showPhone}
	<div
		use:draggable={{
			handleSelector: '.phone-header',
			onPositionChange: (x, y) => (phonePos = { x, y })
		}}
		class="absolute z-40"
		style="left: {phonePos.x}px; top: {phonePos.y}px;"
	>
		<div class="p-4">
			<div class="mockup-phone border-primary">
				<div class="mockup-phone-camera"></div>
				<div class="mockup-phone-display flex flex-col border-primary bg-gray-100">
					<!-- Phone Header -->
					<div class="phone-header bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 cursor-move">
						<div class="flex items-center">
							
							<h3 class="font-semibold text-lg">Messages</h3>
						</div>
					</div>
					<!-- Phone Content -->
					<div class="flex-1 overflow-y-auto bg-white">
						{#if selectedMessage !== null}
								<button
									class="text-black mr-3 p-1 rounded transition-colors"
									aria-label="Back to inbox"
									on:click={goBackToInbox}
								> 
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
									</svg> Go Back
								</button>
							{/if}
						{#if selectedMessage === null}
							<!-- Inbox View -->
							<div class="divide-y divide-gray-200">
								{#each phoneMessages as message, index}
									<button
										class="w-full text-left p-4 hover:bg-gray-50 transition-colors"
										on:click={() => handleMessageClick(index)}
									>
										<div class="flex items-start space-x-3">
											<div class="flex-shrink-0">
												<div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
													{message.sender.charAt(0)}
												</div>
											</div>
											<div class="flex-1 min-w-0">
												<div class="flex items-center justify-between">
													<p class="text-sm font-semibold text-gray-900">
														{message.sender}
													</p>
													<p class="text-xs text-gray-500">
														{message.time}
													</p>
												</div>
												<p class="text-sm text-gray-600 truncate mt-1">
													{message.preview}
												</p>
												{#if message.unread}
													<span class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
														New
													</span>
												{/if}
											</div>
										</div>
									</button>
								{/each}
							</div>
						{:else}
							<div class="p-4">
								<div class="flex items-center space-x-3 mb-4 pb-3 border-b">
									<div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
										{phoneMessages[selectedMessage].sender.charAt(0)}
									</div>
									<div>
										<p class="font-semibold text-gray-900">
											{phoneMessages[selectedMessage].sender}
										</p>
										<p class="text-xs text-gray-500">
											{phoneMessages[selectedMessage].time}
										</p>
									</div>
								</div>
								<div class="bg-blue-100 rounded-lg p-3">
									<p class="text-sm text-gray-800">
										{phoneMessages[selectedMessage].fullMessage}
									</p>
									
									<!-- Navigation buttons for specific messages -->
									{#if phoneMessages[selectedMessage].id === 1 && $currentStage === STAGES.INTRO}
										<div class="mt-3 pt-3 border-t border-blue-200">
											<button 
												class="btn btn-primary btn-sm w-full"
												on:click={() => {
													progressStory(); // Progress to PHISHING_EMAIL stage
													showMail = true;
													showPhone = false;
												}}
											>
												📧 Start Email Analysis
											</button>
										</div>
									{/if}
									
									{#if phoneMessages[selectedMessage].id === 2 && $currentStage === STAGES.GOBUSTER_SCAN}
										<div class="mt-3 pt-3 border-t border-blue-200">
											<button 
												class="btn btn-success btn-sm w-full"
												on:click={() => {
													showBrowser = true;
													showPhone = false;
												}}
											>
												🌐 Open Browser App
											</button>
										</div>
									{/if}
									
									{#if phoneMessages[selectedMessage].id === 2.5 && $currentStage === STAGES.GOBUSTER_SCAN}
										<div class="mt-3 pt-3 border-t border-blue-200">
											<button 
												class="btn btn-success btn-sm w-full"
												on:click={() => {
													showBrowser = true;
													showPhone = false;
												}}
											>
												🕷️ Start Gobuster Scan
											</button>
										</div>
									{/if}
									
									{#if phoneMessages[selectedMessage].id === 3 && $currentStage === STAGES.PASSWORD_CRACK}
										<div class="mt-3 pt-3 border-t border-blue-200">
											<button 
												class="btn btn-warning btn-sm w-full"
												on:click={() => {
													showMiniGame = true;
													showPhone = false;
												}}
											>
												🔓 Test Password Security
											</button>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
					<!-- Phone Footer -->
					<div class="border-t bg-gray-50 p-3">
						<div class="flex items-center space-x-2">
							<input 
								type="text" 
								placeholder="Type a message..." 
								class="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								disabled
							/>
							<button class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600" disabled>
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	{/if}

	<!-- Use the new BrowserWindow component -->
	<BrowserWindow
		isOpen={showBrowser}
		position={browserPos}
	/>

	{#if showMiniGame}
	<div
		use:draggable={{ handleSelector: '.window-bar', onPositionChange: (x, y) => miniPos = { x, y } }}
		class="absolute w-96 bg-white p-4 rounded-xl shadow-2xl text-black"
		style="left: {miniPos.x}px; top: {miniPos.y}px;"
	>
		<div class="window-bar cursor-move font-bold mb-3 text-center">
			🛡️ Password Security Trainer
		</div>

		<div class="space-y-3">
			<p class="text-sm text-gray-600">Help Lily create a strong password! Type different passwords to see what makes them secure.</p>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Test Password:</label>
				<input
					type="password"
					class="input input-bordered w-full bg-white"
					placeholder="Try: password, Admin123!, MySecur3P@ssw0rd!"
					bind:value={passwordInput}
					on:input={checkPassword}
				/>
			</div>

			{#if passwordStrength}
				<div class="bg-gray-50 rounded-lg p-3 border">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">Strength:</span>
						<span class="text-lg font-bold {passwordScore <= 2 ? 'text-red-600' : passwordScore <= 3 ? 'text-yellow-600' : 'text-green-600'}">
							{passwordStrength}
						</span>
					</div>

					<div class="w-full bg-gray-200 rounded-full h-2 mb-2">
						<div class="bg-{passwordScore <= 1 ? 'red' : passwordScore <= 2 ? 'orange' : passwordScore <= 3 ? 'yellow' : 'green'}-500 h-2 rounded-full transition-all duration-300"
							 style="width: {Math.min(passwordScore * 20, 100)}%"></div>
					</div>

					{#if passwordFeedback}
						<div class="text-xs space-y-1">
							{#each passwordFeedback.split('\n') as line}
								<div class="flex items-start">
									<span class="mr-1">{line}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
				<h4 class="text-sm font-semibold text-blue-800 mb-2">💡 Password Tips:</h4>
				<ul class="text-xs text-blue-700 space-y-1">
					<li>• Use 12+ characters for better security</li>
					<li>• Mix uppercase, lowercase, numbers, symbols</li>
					<li>• Avoid dictionary words and personal info</li>
					<li>• Consider using a passphrase: "Coffee&Croissant2024!"</li>
				</ul>
			</div>

			<div class="text-center">
				<button class="btn btn-secondary btn-sm" on:click={() => passwordInput = ''}>
					Clear & Try Again
				</button>
			</div>
		</div>
	</div>
	{/if}

	<!-- Use the new MailWindow component for the email app -->
	<MailWindow 
		isOpen={showMail}
		position={mailPos}
	/>

</div>