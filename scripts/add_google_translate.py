import glob
import re

files = glob.glob('*.html')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace the lang-toggle button with google translate div
    original_btn = r'<button id="lang-toggle"[^>]*>.*?</button>'
    new_div = r'<div id="google_translate_element" class="flex items-center justify-center scale-90 origin-right"></div>'
    
    if re.search(original_btn, content):
        content = re.sub(original_btn, new_div, content)
    
    # 2. Add the Google Translate script before the closing </body> tag if not present
    if 'googleTranslateElementInit' not in content:
        script_snippet = """
    <!-- Google Translate Script -->
    <script type="text/javascript">
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</body>"""
        # Replace the very last </body>
        content = re.sub(r'</body>\s*</html>', f'{script_snippet}\n</html>', content)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Append CSS rules for Google Translate to match dark theme
css_rules = """
/* Google Translate Widget Overrides */
.goog-te-gadget {
    color: transparent !important;
    font-family: 'Inter', sans-serif !important;
}
.goog-te-gadget .goog-te-combo {
    color: #e5e7eb !important;
    background-color: #1f2937 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 0.375rem !important;
    padding: 0.25rem 0.5rem !important;
    font-size: 0.75rem !important;
    outline: none !important;
    cursor: pointer;
    transition: all 0.2s;
}
.goog-te-gadget .goog-te-combo:hover {
    background-color: #374151 !important;
}
.goog-te-gadget .goog-te-combo:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f6 !important;
}
/* Hide the Google Translate branding/toolbar */
.goog-te-banner-frame.skiptranslate, .skiptranslate.goog-te-gadget > span {
    display: none !important;
}
body {
    top: 0px !important; 
}
"""

with open('style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

if '.goog-te-gadget' not in css_content:
    with open('style.css', 'a', encoding='utf-8') as f:
        f.write(css_rules)

print("Google Translate integrated successfully!")
