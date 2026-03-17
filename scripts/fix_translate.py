import glob
import re

files = glob.glob('*.html')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the InlineLayout.SIMPLE so it falls back to a native scrolling <select> dropdown
    if "layout: google.translate.TranslateElement.InlineLayout.SIMPLE" in content:
        content = content.replace("layout: google.translate.TranslateElement.InlineLayout.SIMPLE", "")
        # There might be a dangling comma before it, let's fix it just in case
        content = content.replace("pageLanguage: 'en',\n                \n", "pageLanguage: 'en'\n")
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Updated translation widget to use native scrolling dropdown!")
