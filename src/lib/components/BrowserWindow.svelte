<script lang="ts">
    import { currentStage, STAGES, addXP, progressStory } from '$lib/components/storyStore';
    import { draggable } from '$lib/components/draggable';

    export let isOpen = false;
    export let position = { x: 250, y: 250 };
  
    let url = "http://sweetbytes.local";
    let scanOutput: string[] = [];
    let scanning = false;
    let scanComplete = false;
    let foundAdmin = false;
    let showLoginForm = false;
    let username = "";
    let password = "";
    let loginAttempts = 0;
    let loginSuccess = false;
    let loginFeedback = "";

    const directories = [
      "/", "/about", "/contact", "/blog", "/bakery", "/images", "/css", "/.git", "/backup", "/admin"
    ];
  
    function startScan() {
      scanning = true;
      scanOutput = [];
      foundAdmin = false;
      scanComplete = false;
      let i = 0;
  
      function step() {
        if (i < directories.length) {
          scanOutput = [
            ...scanOutput,
            `Found: ${directories[i]}`
          ];
          if (directories[i] === "/admin") foundAdmin = true;
          i++;
          setTimeout(step, 400);
        } else {
          scanComplete = true;
          scanning = false;
          if (foundAdmin) {
            addXP(20);
            setTimeout(() => {
              if ($currentStage === STAGES.GOBUSTER_SCAN) progressStory();
            }, 1200);
          }
        }
      }
  
      step();
    }

    function openAdminPage() {
      if (foundAdmin && scanComplete) {
        showLoginForm = true;
        url = "http://sweetbytes.local/admin";
      }
    }

    function tryLogin() {
      loginAttempts++;
      loginFeedback = "";

      // Common weak passwords that should succeed
      const weakPasswords = ["admin", "password", "sweetbaker123", "bakery123", "lily123"];

      if ((username === "admin" || username === "lily") && weakPasswords.includes(password)) {
        loginSuccess = true;
        loginFeedback = "Login successful! But this password is too weak and easily guessed.";
        addXP(25);
        setTimeout(() => {
          if ($currentStage === STAGES.PASSWORD_CRACK) {
            progressStory();
          }
        }, 2000);
      } else if (loginAttempts >= 3) {
        loginFeedback = "Account temporarily locked after 3 failed attempts. This is a good security measure!";
      } else {
        loginFeedback = `Login failed. ${3 - loginAttempts} attempts remaining.`;
        addXP(5);
      }
    }

    function resetLogin() {
      username = "";
      password = "";
      loginAttempts = 0;
      loginSuccess = false;
      loginFeedback = "";
      showLoginForm = false;
      url = "http://sweetbytes.local";
    }
  </script>
  
  {#if isOpen}
  <div
    use:draggable={{
      handleSelector: '.window-bar',
      onPositionChange: (x, y) => (position = { x, y })
    }}
    class="absolute h-[70%] w-[60%] rounded-xl bg-white shadow-2xl ring-2 ring-info/50"
    style="left: {position.x}px; top: {position.y}px;"
  >
    <div class="window-bar flex cursor-move items-center justify-between rounded-t-xl border-b bg-base-100 px-4 py-2">
      <div class="flex items-center space-x-2">
        <div class="h-3 w-3 rounded-full bg-error"></div>
        <div class="h-3 w-3 rounded-full bg-warning"></div>
        <div class="h-3 w-3 rounded-full bg-success"></div>
      </div>
      <div class="mx-4 flex-1">
        <div class="flex items-center rounded-lg border bg-white px-3 py-1">
          <input type="text" bind:value={url} class="flex-1 text-sm outline-none text-black" />
        </div>
      </div>
    </div>
    <div class="p-6">
      {#if !showLoginForm}
        <!-- Directory Scanner View -->
        <h2 class="text-lg font-bold mb-4 text-gray-800">🔍 Gobuster Directory Scanner</h2>
        <p class="text-sm text-gray-600 mb-4">Help Lily find hidden pages on her bakery website that Dr. Phish might have found!</p>

        <div class="mb-4">
          <button class="btn btn-primary btn-sm" on:click={startScan} disabled={scanning || scanComplete}>
            {scanning ? 'Scanning...' : scanComplete ? 'Scan Complete' : 'Start Directory Scan'}
          </button>
        </div>

        <div class="bg-gray-900 text-green-400 font-mono rounded p-4 h-48 overflow-auto text-sm">
          $ gobuster dir -u {url} -w wordlist.txt -x php,html<br>
          {#each scanOutput as line}
            {line}<br>
          {/each}
          {#if scanComplete && foundAdmin}
            <div class="mt-2 text-yellow-300 font-semibold">[!] ALERT: Exposed admin directory found!</div>
            <div class="text-green-300">Status: 200 - /admin (Size: 1234)</div>
          {/if}
          {#if scanComplete && !foundAdmin}
            <div class="mt-2 text-green-300">Scan complete. Website appears secure.</div>
          {/if}
        </div>

        {#if scanComplete && foundAdmin}
          <div class="mt-4 p-3 rounded bg-orange-100 text-orange-800 border-l-4 border-orange-500">
            <div class="flex items-center">
              <span class="text-lg mr-2">⚠️</span>
              <div>
                <p class="font-semibold">Security Issue Found!</p>
                <p class="text-sm">The admin page is publicly accessible. Let's investigate...</p>
              </div>
            </div>
            <button class="btn btn-warning btn-sm mt-2" on:click={openAdminPage}>
              Open /admin page
            </button>
          </div>
        {/if}
      {:else}
        <!-- Admin Login Form View -->
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">🏪 SweetBytes Bakery - Admin Panel</h2>
          <p class="text-sm text-gray-600">This admin page should be protected!</p>
        </div>

        {#if !loginSuccess}
          <div class="bg-white border rounded-lg p-6 max-w-sm mx-auto">
            <h3 class="text-lg font-semibold mb-4 text-center">Admin Login</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username:</label>
                <input
                  type="text"
                  bind:value={username}
                  placeholder="Try 'admin' or 'lily'"
                  class="input input-bordered w-full text-sm"
                  disabled={loginAttempts >= 3}
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                <input
                  type="password"
                  bind:value={password}
                  placeholder="Common weak passwords..."
                  class="input input-bordered w-full text-sm"
                  disabled={loginAttempts >= 3}
                />
              </div>

              <button
                class="btn btn-primary w-full"
                on:click={tryLogin}
                disabled={!username || !password || loginAttempts >= 3}
              >
                Login
              </button>
            </div>

            {#if loginFeedback}
              <div class="mt-4 p-2 rounded text-sm {loginSuccess ? 'bg-green-100 text-green-700' : loginAttempts >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
                {loginFeedback}
              </div>
            {/if}

            <div class="mt-4 text-xs text-gray-500">
              <p><strong>Hint:</strong> Try common passwords like "admin", "password", or bakery-related terms!</p>
            </div>
          </div>
        {:else}
          <!-- Successful Login - Educational Message -->
          <div class="bg-red-100 border border-red-400 rounded-lg p-6">
            <div class="text-center">
              <h3 class="text-lg font-bold text-red-800 mb-2">🚨 Security Vulnerability Demonstrated!</h3>
              <p class="text-red-700 mb-4">You successfully broke into the admin panel using a weak password.</p>
            </div>

            <div class="bg-white rounded p-4 mb-4">
              <h4 class="font-semibold text-gray-800 mb-2">What happened:</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• The admin page was publicly accessible (found with Gobuster)</li>
                <li>• Weak password was easily guessed (brute-force attack)</li>
                <li>• No multi-factor authentication was required</li>
              </ul>
            </div>

            <div class="bg-green-50 rounded p-4">
              <h4 class="font-semibold text-green-800 mb-2">How to protect against this:</h4>
              <ul class="text-sm text-green-700 space-y-1">
                <li>• Use strong, unique passwords (12+ characters)</li>
                <li>• Hide admin pages from public access</li>
                <li>• Enable multi-factor authentication (2FA)</li>
                <li>• Implement account lockouts after failed attempts</li>
                <li>• Use IP restrictions for admin access</li>
              </ul>
            </div>

            <button class="btn btn-secondary btn-sm mt-4 w-full" on:click={resetLogin}>
              Back to Scanner
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
  {/if}