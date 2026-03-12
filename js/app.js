document.addEventListener('DOMContentLoaded', () => {
    try {
        window.apiService = new window.APILogic();
        window.uiService = new window.UILogic();
        console.log("OmniGuard Setup Complete.");
    } catch (e) {
        console.error("Critical failure during initialization sequence:", e);
    }
});
