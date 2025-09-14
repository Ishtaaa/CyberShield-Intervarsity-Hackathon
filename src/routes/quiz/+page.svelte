<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import {userXP} from '$lib/components/stores';

	let currentQuestion = 0;
	let score = 0;
	let selectedAnswer = '';
	let showResult = false;
	let quizComplete = false;

	const questions = [
		{
			question: "What is the most common cyber attack?",
			options: ["Phishing", "DDoS", "Malware", "SQL Injection"],
			correct: 0
		},
		{
			question: "What does HTTPS stand for?",
			options: ["HyperText Transfer Protocol Secure", "High Tech Transfer Protocol", "Home Transfer Protocol", "HyperText Transfer Protocol"],
			correct: 0
		},
		{
			question: "What is two-factor authentication?",
			options: ["Using two passwords", "Using password + biometric", "Using two different devices", "Using password + second verification method"],
			correct: 3
		},
		{
			question: "What is the most secure type of password?",
			options: ["Your Birthday", "A mix of letters, numbers and symbols", "123456", "Your pet's name"],
			correct: 1
		},
		{
			question: "You receive an email saying you won a prize and must click a link to claim it. What should you do?",
			options: ["Click the link immediately", "Delete the email", "Forward it to your friends", "Reply with your personal info"],
			correct: 1
		},
		{
			question: "An attacker pretends to be your IT admin and asks for your password. What's the right response?",
			options: ["Give it, since they're from IT", "Share only half your password", "Refuse and report the attempt", "Ignore them"],
			correct: 2
		},
		{
			question: "Which of these links looks the safest?",
			options: ["http://bank-login.security-updates.com", "https://yourbank.com/login", "http://yourbank.freeprizes.net", "http://192.168.0.1/secure"],
			correct: 1
		},
		{
			question: "What should you do if your computer is locked by ransomware demanding payment?",
			options: ["Pay immediately", "Restart your device", "Ignore it and keep using your computer", "Disconnect from the network and seek IT/security help"],
			correct: 3
		},
		{
			question: "Sharing your phone number and address on social media is safe if your account is private?",
			options: ["False", "True"],
			correct: 0
		},
		{
			question: "It is safe to log into your bank account using free public Wi-Fi.",
			options: ["True", "False"],
			correct: 0
		},

	];

	function selectAnswer(answer: string, index: number) {
		if (showResult) return;
		
		selectedAnswer = answer;
		showResult = true;
		
		if (index === questions[currentQuestion].correct) {
			score += 10;
		}
	}

	function nextQuestion() {
		if (currentQuestion < questions.length - 1) {
			currentQuestion++;
			selectedAnswer = '';
			showResult = false;
		} else {
			quizComplete = true;
		}
	}

	function gotoDesktop(){
		userXP.set(score);
		goto("/desktop")
	}

	function restartQuiz() {
		currentQuestion = 0;
		score = 0;
		selectedAnswer = '';
		showResult = false;
		quizComplete = false;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-black via-green-900 to-black flex items-center justify-center p-8">
	<div class="max-w-4xl w-full">
		{#if !quizComplete}
			<div class="bg-white/10 backdrop-blur-lg rounded-xl p-8">
				<div class="text-center mb-8">
					<h1 class="text-4xl font-bold text-white mb-4">Lets see what you know</h1>
					<p class="text-xl text-gray-300">Question {currentQuestion + 1} of {questions.length}</p>
					<p class="text-2xl text-white font-semibold mt-4">Score: {score}</p>
				</div>
				
				<div class="mb-8">
					<h2 class="text-3xl font-semibold text-white mb-8 text-center">
						{questions[currentQuestion].question}
					</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each questions[currentQuestion].options as option, index}
							<button
								class="p-6 text-left bg-white/20 hover:bg-white/30 text-green-400 rounded-lg border border-green-400/30 transition-all duration-300 transform hover:scale-105 text-xl"
								on:click={() => selectAnswer(option, index)}
								disabled={showResult}
							>
								{option}
							</button>
						{/each}
					</div>
				</div>
				
				{#if showResult}
					<div class="text-center">
						<div class="mb-4">
							{#if selectedAnswer === questions[currentQuestion].options[questions[currentQuestion].correct]}
								
								<p class="text-2xl font-bold text-green-400 mt-2">Correct!</p>
							{:else}
								
								<p class="text-2xl font-bold text-red-400 mt-2">Incorrect</p>
								<p class = "text-xl text-white">the correct answer is: {questions[currentQuestion].options[questions[currentQuestion].correct]}</p>
							{/if}
						</div>
						<button
							class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105"
							on:click={nextQuestion}
						>
							{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
				<h1 class="text-5xl font-bold text-white mb-6">Quiz Complete!</h1>
				<p class="text-3xl text-gray-300 mb-8">Your Score: <span class="font-bold text-yellow-400">{score}</span> / {questions.length * 10}</p>
				
				{#if score >= questions.length * 8}
					<p class="text-2xl text-green-400 mb-6">Excellent! You seem to know what you're doing. The next challenges should be a breeze.</p>
					<button
					class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105"
					on:click={gotoDesktop}
				>
					Continue
				</button>
				{:else if score >= questions.length * 6}
					<p class="text-2xl text-yellow-400 mb-6">Good job! You have solid cybersecurity knowledge. You can take the quiz again to enhance your knowledge or continue to the next challenge</p>
					<button
					class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105"
					on:click={restartQuiz}
				>
					Take Quiz Again
				</button>
				<button
					class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105"
					on:click={gotoDesktop}
				>
					Continue
				</button>
				{:else}
					<p class="text-2xl text-red-400 mb-6">Keep learning! Cybersecurity is important.</p>
					<button
					class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105"
					on:click={restartQuiz}
				>
					Take Quiz Again
				</button>
				{/if}
				
				
			</div>
		{/if}
	</div>
</div>