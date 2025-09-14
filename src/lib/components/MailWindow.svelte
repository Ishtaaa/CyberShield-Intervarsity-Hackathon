<script lang="ts">
    import { currentStage, STAGES, addXP, progressStory, categorizeEmail, areAllEmailsCategorized, categorizedEmails, totalEmails } from '$lib/components/storyStore';
    import { draggable } from '$lib/components/draggable';

    export let isOpen: boolean = false;
    export let position: { x: number; y: number } = { x: 200, y: 150 };
  
    // Define Email type
    interface Email {
      id: number;
      sender: string;
      senderDisplay: string;
      subject: string;
      body: string;
      isPhishing: boolean;
      unread: boolean;
    }
  
    // Example emails
    let emails: Email[] = [
      {
        id: 1,
        sender: "noreply@cyberbank-securitty.xyz",
        senderDisplay: "CyberBank",
        subject: "Your account is vulnerable",
        body: "Dear Valued Customer, You need to reset your password as soon as possible or your account will be disabled and you will not be able to receive any payments made to you. Please act fast and click the link below: cyberbank-securitty.xyz/urgent-reset",
        isPhishing: true,
        unread: true
      },
      {
        id: 2,
        sender: "customer@legitcompany.com",
        senderDisplay: "Legit Company",
        subject: "Order Confirmation #12345",
        body: "Thank you for your order! Your receipt is attached. If you have any questions, please contact our support team.",
        isPhishing: false,
        unread: true
      },
      {
        id: 3,
        sender: "security@sweetbytes.com",
        senderDisplay: "SweetBytes Bakery",
        subject: "Website Update Complete",
        body: "Hi Lily, Your website security update has been completed successfully. All systems are secure and running normally.",
        isPhishing: false,
        unread: false
      },
      {
        id: 4,
        sender: "admin@sweetbytez.net",
        senderDisplay: "SweetBytes Admin",
        subject: "URGENT: Payment Issue",
        body: "There's a problem with your payment processor. Click here to verify your banking details immediately or lose all pending payments: sweetbytez.net/verify-now",
        isPhishing: true,
        unread: false
      }
    ];
  
    // Selected email can be Email or null
    let selectedEmail: Email | null = null;
    let showFeedback: boolean = false;
    let feedbackMsg: string = '';
    let isCorrect: boolean = false;
    let isProgressing: boolean = false;
  
    function selectEmail(email: Email) {
      selectedEmail = email;
      email.unread = false;
      showFeedback = false;
      feedbackMsg = '';
    }
  
    function backToInbox() {
      selectedEmail = null;
      showFeedback = false;
    }
  
    function checkPhishing(isPhishing: boolean) {
      if (!selectedEmail) return;
      showFeedback = true;
  
      if (isPhishing === selectedEmail.isPhishing) {
        isCorrect = true;
        if (isPhishing) {
          if (selectedEmail.id === 1) {
            feedbackMsg = "Correct! Red flags: Suspicious domain 'cyberbank-securitty.xyz' (typo), urgent language, and unknown sender.";
          } else if (selectedEmail.id === 4) {
            feedbackMsg = "Correct! Red flags: Wrong domain 'sweetbytez.net' (should be .com), urgent threats, and suspicious link.";
          } else {
            feedbackMsg = "Correct! This is a phishing email. Well spotted!";
          }
        } else {
          feedbackMsg = "Correct! This appears legitimate - proper domain, no urgent threats, and professional tone.";
        }
        addXP(20);
        
        
        categorizeEmail(selectedEmail.id);
  
        
      } else {
        isCorrect = false;
        if (isPhishing) {
          feedbackMsg = "Actually, this is legitimate. Look for proper domains, professional language, and no urgent threats.";
        } else {
          feedbackMsg = "Actually, this is phishing! Watch for suspicious domains, urgent language, and threats.";
        }
        addXP(5);
        
        // Still track as categorized even if wrong (for completion tracking)
        categorizeEmail(selectedEmail.id);
      }
    }
  </script>

  {#if isOpen}
    <div
      use:draggable={{
        handleSelector: '.window-header',
        onPositionChange: (x, y) => (position = { x, y })
      }}
      class="absolute z-40 w-96 bg-white rounded-xl shadow-2xl border border-gray-300"
      style="left: {position.x}px; top: {position.y}px;"
    >
      <!-- Window Header -->
      <div class="window-header bg-blue-600 text-white p-3 rounded-t-xl cursor-move flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <h3 class="font-bold">Mail</h3>
        </div>
      </div>

      <!-- Mail Content -->
      <div class="h-80 overflow-y-auto bg-white text-black">
        {#if !selectedEmail}
          <!-- Progress Indicator -->
          {#if $currentStage === STAGES.PHISHING_EMAIL}
            <div class="p-3 bg-blue-50 border-b border-blue-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-800">Email Analysis Progress</span>
                <span class="text-sm text-blue-600">{$categorizedEmails.size} / {$totalEmails} categorized</span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                     style="width: {($categorizedEmails.size / $totalEmails) * 100}%"></div>
              </div>
              {#if $categorizedEmails.size === $totalEmails}
                <p class="text-xs text-green-600 mt-1 font-medium">🎉 All emails analyzed! Great work!</p>
                <p class="text-xs text-gray-500">Debug: Stage={$currentStage}, Emails={$categorizedEmails.size}/{$totalEmails}</p>
                {#if $currentStage === STAGES.PHISHING_EMAIL}
                  {#if isProgressing}
                    <div class="mt-2 p-2 bg-blue-100 rounded text-center">
                      <p class="text-xs text-blue-700">🚀 Advancing to next stage...</p>
                    </div>
                  {:else}
                    <button 
                      class="btn btn-success btn-sm mt-2 w-full font-semibold"
                      on:click={() => {
                        console.log('Button clicked! Current stage:', $currentStage, 'PHISHING_EMAIL:', STAGES.PHISHING_EMAIL);
                        if ($currentStage === STAGES.PHISHING_EMAIL && !isProgressing) {
                          console.log('Progressing story...');
                          isProgressing = true;
                          setTimeout(() => {
                            progressStory();
                            isProgressing = false;
                          }, 1000);
                        }
                      }}
                    >
                      🚀 Proceed to Next Stage
                    </button>
                    <p class="text-xs text-gray-500 mt-1 text-center">Ready for the next cybersecurity challenge!</p>
                  {/if}
                {/if}
              {/if}
            </div>
          {/if}
          
          <!-- Email List -->
          <div class="divide-y divide-gray-200">
            {#each emails as email}
              <button
                class="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-start space-x-3"
                on:click={() => selectEmail(email)}
              >
                <div class="flex-shrink-0 mt-1">
                  {#if $categorizedEmails.has(email.id)}
                    <div class="w-2 h-2 bg-green-500 rounded-full" title="Email analyzed"></div>
                  {:else if email.unread}
                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {:else}
                    <div class="w-2 h-2"></div>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {email.senderDisplay}
                    </p>
                  </div>
                  <p class="text-xs text-gray-500 truncate">{email.sender}</p>
                  <p class="text-sm text-gray-700 truncate mt-1">{email.subject}</p>
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <!-- Email Detail -->
          <div class="p-4">
            <!-- Back Button -->
            <button
              class="mb-3 text-blue-600 hover:text-blue-800 text-sm"
              on:click={backToInbox}
            >
              ← Back to Inbox
            </button>

            <!-- Email Header -->
            <div class="border-b pb-3 mb-4">
              <h3 class="font-bold text-lg">{selectedEmail.subject}</h3>
              <p class="text-sm text-gray-600">From: {selectedEmail.senderDisplay}</p>
              <p class="text-xs text-gray-500">{selectedEmail.sender}</p>
            </div>

            <!-- Email Body -->
            <div class="mb-4 p-3 bg-gray-50 rounded">
              <p class="text-sm">{selectedEmail.body}</p>
            </div>

            <!-- Phishing Check Buttons -->
            {#if !showFeedback}
              <div class="border-t pt-3">
                <p class="text-sm font-semibold mb-3">Is this email phishing?</p>
                <div class="flex space-x-2">
                  <button
                    class="btn btn-error btn-sm"
                    on:click={() => checkPhishing(true)}
                  >
                    Yes, Phishing
                  </button>
                  <button
                    class="btn btn-success btn-sm"
                    on:click={() => checkPhishing(false)}
                  >
                    No, Legitimate
                  </button>
                </div>
              </div>
            {:else}
              <!-- Feedback -->
              <div class="border-t pt-3">
                <div class="p-3 rounded {isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  <p class="text-sm font-semibold">
                    {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                  </p>
                  <p class="text-sm">{feedbackMsg}</p>
                  {#if isCorrect}
                    <p class="text-xs mt-1">+20 XP earned!</p>
                  {:else}
                    <p class="text-xs mt-1">+5 XP earned for trying!</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}