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
            if (localStorage.getItem('ndem_high_contrast') === 'true') {
                document.documentElement.classList.add('high-contrast');
            }

            toggleContrast.addEventListener('click', () => {
                document.documentElement.classList.toggle('high-contrast');
                localStorage.setItem('ndem_high_contrast', document.documentElement.classList.contains('high-contrast'));
            });
        }

        if (toggleTextSize) {
            // Load state
            if (localStorage.getItem('ndem_large_text') === 'true') {
                document.documentElement.classList.add('large-text');
            }

            toggleTextSize.addEventListener('click', () => {
                document.documentElement.classList.toggle('large-text');
                localStorage.setItem('ndem_large_text', document.documentElement.classList.contains('large-text'));
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
