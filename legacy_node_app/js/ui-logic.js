/**
 * UI Logic Module
 * Handles accessibility toggles, sidebar collapses, layer manager states, and general DOM manipulation
 */

class UILogic {
    constructor() {
        this.initAccessibility();
        this.initSidebars();
        this.initLayerManager();
        this.initAccordions();
        this.initLanguageToggle();
        this.initPWAInstallBanner();
    }

    initLanguageToggle() {
        const btn = document.getElementById('lang-toggle');
        if (!btn) return;

        // Load saved preference
        if (localStorage.getItem('ndem_hindi_mode') === 'true') {
            document.body.classList.add('hindi-mode');
            btn.classList.add('lang-hi-active');
            btn.textContent = 'A';
            btn.title = 'Switch to English';
        }

        btn.addEventListener('click', () => {
            const isHindi = document.body.classList.toggle('hindi-mode');
            localStorage.setItem('ndem_hindi_mode', isHindi);
            btn.classList.toggle('lang-hi-active', isHindi);
            btn.textContent = isHindi ? 'A' : 'अ';
            btn.title = isHindi ? 'Switch to English' : 'Switch to Hindi';
        });
    }

    initPWAInstallBanner() {
        let deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Only show on mobile/tablet
            if (window.innerWidth > 1024) return;

            // Create banner if not already shown
            if (localStorage.getItem('ndem_pwa_dismissed')) return;

            const banner = document.createElement('div');
            banner.id = 'pwa-install-banner';
            banner.className = 'fixed bottom-20 left-4 right-4 z-[99998] glass-panel border border-indigo-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.7)] animate-fade-in-up';
            banner.innerHTML = `
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg border border-white/20">
                    <i class="fa-solid fa-earth-americas text-white text-lg"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white font-semibold text-sm">Install OmniGuard AI</p>
                    <p class="text-gray-400 text-xs">Get instant disaster alerts & offline access</p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button id="pwa-install-btn" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">Install</button>
                    <button id="pwa-dismiss-btn" class="bg-white/5 hover:bg-white/10 text-gray-400 text-xs px-2 py-2 rounded-lg transition-colors"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
            document.body.appendChild(banner);

            document.getElementById('pwa-install-btn').addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    deferredPrompt = null;
                    banner.remove();
                }
            });

            document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
                localStorage.setItem('ndem_pwa_dismissed', 'true');
                banner.remove();
            });
        });

        window.addEventListener('appinstalled', () => {
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.remove();
        });
    }


    initAccordions() {
        const detailsElements = document.querySelectorAll('details.group');
        detailsElements.forEach((detail) => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    detailsElements.forEach((otherDetail) => {
                        if (otherDetail !== detail && otherDetail.parentNode === detail.parentNode && otherDetail.open) {
                            otherDetail.removeAttribute('open');
                        }
                    });
                }
            });
        });
    }

    initAccessibility() {
        const toggleContrast = document.getElementById('toggle-contrast');
        const toggleTextSize = document.getElementById('toggle-text-size');

        if (toggleContrast) {
            // Load state
            const hcOn = localStorage.getItem('ndem_high_contrast') === 'true';
            if (hcOn) {
                document.documentElement.classList.add('high-contrast');
                toggleContrast.classList.add('hc-active');
            }

            toggleContrast.addEventListener('click', () => {
                const isOn = document.documentElement.classList.toggle('high-contrast');
                localStorage.setItem('ndem_high_contrast', isOn);
                toggleContrast.classList.toggle('hc-active', isOn);
            });
        }

        if (toggleTextSize) {
            // Load state
            const ltOn = localStorage.getItem('ndem_large_text') === 'true';
            if (ltOn) {
                document.documentElement.classList.add('large-text');
                toggleTextSize.classList.add('lt-active');
            }

            toggleTextSize.addEventListener('click', () => {
                const isOn = document.documentElement.classList.toggle('large-text');
                localStorage.setItem('ndem_large_text', isOn);
                toggleTextSize.classList.toggle('lt-active', isOn);
            });
        }
    }


    initSidebars() {
        // Mobile Menu
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const mainNav = document.getElementById('main-nav');
        if (mobileBtn && mainNav) {
            mobileBtn.addEventListener('click', () => {
                mainNav.classList.toggle('hidden');
                mainNav.classList.toggle('flex');
                mainNav.classList.toggle('flex-col');
                mainNav.classList.toggle('absolute');
                mainNav.classList.toggle('top-16');
                mainNav.classList.toggle('left-0');
                mainNav.classList.toggle('w-full');
                mainNav.classList.toggle('bg-gray-900');
                mainNav.classList.toggle('p-4');
                mainNav.classList.toggle('z-50');
            });
        }

        // Left Sidebar Collapse (Optional for Desktop)
        // Right Sidebar Close
        const rightSidebar = document.getElementById('right-sidebar');
        const closeRightBtn = document.getElementById('close-context-btn');

        if (closeRightBtn && rightSidebar) {
            closeRightBtn.addEventListener('click', () => {
                this.closeRightPanel();
            });
        }
    }

    openRightPanel(contentHTML) {
        const rightSidebar = document.getElementById('right-sidebar');
        const contextContent = document.getElementById('context-content');

        if (rightSidebar && contextContent) {
            contextContent.innerHTML = contentHTML;
            rightSidebar.classList.remove('hidden');
            rightSidebar.classList.add('flex');

            // Adjust left sidebar/map layout on mobile if needed
            if (window.innerWidth < 1024) {
                // On mobile, opening right panel might cover the screen or we just scroll to it
                rightSidebar.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    closeRightPanel() {
        const rightSidebar = document.getElementById('right-sidebar');
        if (rightSidebar) {
            rightSidebar.classList.add('hidden');
            rightSidebar.classList.remove('flex');
        }
    }

    initLayerManager() {
        const layerToggleBtn = document.getElementById('layer-manager-toggle');
        const layerControls = document.getElementById('layer-controls');
        const icon = document.getElementById('layer-toggle-icon');

        if (layerToggleBtn && layerControls) {
            // Load state
            const isCollapsed = localStorage.getItem('ndem_layer_collapsed') === 'true';
            if (isCollapsed) {
                this._collapseLayer(layerControls, icon);
            }

            layerToggleBtn.addEventListener('click', () => {
                if (layerControls.style.maxHeight === '0px' || layerControls.classList.contains('hidden-layer')) {
                    this._expandLayer(layerControls, icon);
                    localStorage.setItem('ndem_layer_collapsed', 'false');
                } else {
                    this._collapseLayer(layerControls, icon);
                    localStorage.setItem('ndem_layer_collapsed', 'true');
                }
            });
        }
    }

    _collapseLayer(el, icon) {
        el.style.maxHeight = '0px';
        el.style.opacity = '0';
        el.style.paddingTop = '0';
        el.style.paddingBottom = '0';
        el.style.marginTop = '0';
        el.classList.add('hidden-layer');
        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }

    _expandLayer(el, icon) {
        el.classList.remove('hidden-layer');
        el.style.maxHeight = el.scrollHeight + 'px';
        el.style.opacity = '1';
        el.style.paddingTop = '0.75rem';
        el.style.paddingBottom = '0.75rem';
        setTimeout(() => {
            el.style.maxHeight = 'none'; // allow overflow
        }, 300);
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }
}

// Export for app.js
window.UILogic = UILogic;
