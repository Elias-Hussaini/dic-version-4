// start language-loader=.js
// ================================================
// لودر تغییر زبان
// ================================================

(function() {
    'use strict';
    
    let loader = null;
    
    function createLoader() {
        if (document.getElementById('lang-loader')) return;
        
        loader = document.createElement('div');
        loader.id = 'lang-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring inner"></div>
                    <i class="fas fa-language loader-icon"></i>
                </div>
                
                <div class="loader-text">
                    <h3 id="loader-title">${LanguageSystem.isGerman() ? 'در حال تغییر به انگلیسی' : 'Switching to Persian'}</h3>
                    <p id="loader-sub">${LanguageSystem.isGerman() ? 'لطفاً صبر کنید...' : 'Please wait...'}</p>
                </div>
                
<div class="loader-flags">
    <div class="flag-item from">
        <span class="flag-emoji">🇮🇷</span>
        <span class="flag-name">فارسی</span>
    </div>
    <i class="fas fa-arrow-${LanguageSystem.isEnglish() ? 'right' : 'left'} arrow"></i>
    <div class="flag-item to">
        <span class="flag-emoji">🇬🇧</span>
        <span class="flag-name">انگلیسی</span>
    </div>
</div>       <div class="loader-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(loader);
        addStyles();
    }
    
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #lang-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(15px);
                z-index: 9999999;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            #lang-loader.show {
                display: flex;
                opacity: 1;
            }
            
            .loader-content {
                text-align: center;
                color: white;
                animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            .loader-spinner {
                position: relative;
                width: 100px;
                height: 100px;
                margin: 0 auto 30px;
            }
            
            .spinner-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 4px solid transparent;
                border-top-color: #4361ee;
                border-right-color: #f72585;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .spinner-ring.inner {
                width: 70px;
                height: 70px;
                top: 15px;
                left: 15px;
                border-top-color: #4cc9f0;
                border-right-color: #f8961e;
                animation: spin-reverse 1.5s linear infinite;
            }
            
            .loader-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 32px;
                color: white;
                animation: pulse 1.5s infinite;
            }
            
            .loader-text h3 {
                font-size: 24px;
                margin-bottom: 10px;
                font-family: 'Vazirmatn', sans-serif;
            }
            
            .loader-text p {
                font-size: 16px;
                color: #aaa;
                font-family: 'Vazirmatn', sans-serif;
            }
            
            .loader-flags {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin: 30px 0;
            }
            
            .flag-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 15px 25px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .flag-item.from {
                animation: slideLeft 0.5s;
            }
            
            .flag-item.to {
                animation: slideRight 0.5s;
            }
            
            .flag-emoji {
                font-size: 48px;
            }
            
            .flag-name {
                font-size: 16px;
                font-family: 'Vazirmatn', sans-serif;
            }
            
            .arrow {
                font-size: 24px;
                color: #f72585;
                animation: bounce 1s infinite;
            }
            
            .loader-progress {
                width: 300px;
                height: 4px;
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
                overflow: hidden;
                margin: 0 auto;
            }
            
            .progress-bar {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #4361ee, #f72585, #4cc9f0);
                animation: progress 2s infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes spin-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes slideLeft {
                from { transform: translateX(-30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideRight {
                from { transform: translateX(30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(5px); }
            }
            
            @keyframes progress {
                0% { width: 0%; }
                50% { width: 100%; }
                100% { width: 0%; }
            }
            
            @media (max-width: 768px) {
                .flag-emoji {
                    font-size: 36px;
                }
                
                .flag-item {
                    padding: 10px 20px;
                }
                
                .loader-text h3 {
                    font-size: 20px;
                }
                
                .loader-progress {
                    width: 250px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    window.showLanguageLoader = function() {
        if (!loader) createLoader();
        loader.classList.add('show');
    };
    
    window.hideLanguageLoader = function() {
        if (loader) loader.classList.remove('show');
    };
    
    window.switchLanguage = function(lang) {
        if (lang === LanguageSystem.currentLang) return;
        
        showLanguageLoader();
        
        setTimeout(() => {
            LanguageSystem.setLang(lang);
        }, 2000);
    };
    
    // ایجاد لودر
    createLoader();
})();
// end language-loader=.js