export function AuthStyles() {
  return (
    <style>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInOption {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes moveTrack {
        from { transform: perspective(500px) rotateX(60deg) scale(2) translateY(0); }
        to { transform: perspective(500px) rotateX(60deg) scale(2) translateY(51px); }
      }
      @keyframes heartbeat {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
        50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.5; }
      }
      @keyframes rotateCircle {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes spotlightMove {
        from { transform: translate(-10%, -10%); }
        to { transform: translate(10%, 10%); }
      }
      @keyframes shineText {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
      .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
      .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
      .animation-delay-200 { animation-delay: 0.2s; animation-fill-mode: both; }
      .shine-text {
        background: linear-gradient(110deg, #888 30%, #fff 50%, #888 70%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: shineText 5s linear infinite;
      }
      .input-dark {
        width: 100%;
        padding: 12px 16px;
        background-color: #222;
        border: 1px solid #333;
        border-radius: 6px;
        color: white;
        font-size: 15px;
        font-family: 'Inter', sans-serif;
        transition: all 0.2s ease;
      }
      .input-dark:focus {
        outline: none;
        border-color: #666;
        background-color: #252525;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
      }
      .input-dark::placeholder {
        color: #666;
      }
      .btn-google {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        background-color: #222;
        border: 1px solid #333;
        border-radius: 6px;
        color: #FFF;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
      }
      .btn-google:hover:not(:disabled) {
        background-color: #2a2a2a;
        border-color: #444;
      }
      .btn-google:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .btn-submit {
        width: 100%;
        padding: 12px;
        background-color: #FFFFFF;
        color: #000000;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.1s, background-color 0.2s;
        margin-top: 8px;
      }
      .btn-submit:hover:not(:disabled) {
        background-color: #e0e0e0;
      }
      .btn-submit:active:not(:disabled) {
        transform: scale(0.98);
      }
      .btn-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `}</style>
  );
}
