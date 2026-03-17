import os
import glob
import re

files = glob.glob('*.html')

new_nav_template = """<nav id="main-nav" class="hidden lg:flex space-x-1 lg:space-x-2 items-center">
            <a href="index.html" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400" data-page="index.html">Dashboard</a>
            <a href="disasters.html" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400" data-page="disasters.html">Guidelines</a>
            <a href="emergency.html" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400" data-page="emergency.html">Emergency</a>
            <a href="risk.html" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400" data-page="risk.html">Risk Map</a>
            <a href="predict.html" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400" data-page="predict.html">AI Predict</a>
            <a href="document-library.html" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400" data-page="document-library.html"><i class="fa-solid fa-folder-open mr-1"></i>Docs</a>
            
            <!-- More Dropdown -->
            <div class="relative group">
                <button class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400 flex items-center" id="more-dropdown-btn">
                    More <i class="fa-solid fa-chevron-down ml-1 text-xs"></i>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50 overflow-hidden">
                    <div class="py-2">
                        <a href="contact.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="contact.html">Contacts</a>
                        <a href="preparedness.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="preparedness.html">Kit Planner</a>
                        <a href="training.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="training.html">Training</a>
                        <a href="news.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="news.html">News</a>
                        <a href="volunteer.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="volunteer.html">Volunteer</a>
                        <a href="report.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="report.html">Report</a>
                        <a href="resources.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" data-page="resources.html">Shelters</a>
                    </div>
                </div>
            </div>

            <div class="flex space-x-2 ml-2 border-l border-white/10 pl-2">
                <button id="lang-toggle" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors text-xs font-bold" title="Toggle Hindi/English" aria-label="Toggle Language">अ</button>
                <button id="toggle-contrast" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors" title="High Contrast" aria-label="High Contrast Mode"><i class="fa-solid fa-circle-half-stroke text-sm"></i></button>
                <button id="toggle-text-size" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors" title="Larger Text" aria-label="Toggle Large Text"><i class="fa-solid fa-text-height text-sm"></i></button>
            </div>
        </nav>"""

nav_regex = re.compile(r'<nav id="main-nav".*?</nav>', re.DOTALL)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if not nav_regex.search(content):
        continue

    filename = os.path.basename(file)
    
    custom_nav = new_nav_template
    
    # Setup active link classes depending on if it's a main item or a drop-down item
    if 'href="' + filename + '" class="nav-link' in custom_nav:
        custom_nav = custom_nav.replace(
            f'href="{filename}" class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400"',
            f'href="{filename}" class="nav-link active px-3 py-2 text-sm font-semibold transition-colors text-blue-400"'
        )
    elif 'href="' + filename + '" class="block' in custom_nav:
        custom_nav = custom_nav.replace(
            f'href="{filename}" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"',
            f'href="{filename}" class="block active px-4 py-2 text-sm font-semibold text-blue-400 bg-white/5"'
        )
        # Also make the 'More' button highlighted since an item inside it is active
        custom_nav = custom_nav.replace(
            'class="nav-link px-3 py-2 text-sm font-semibold transition-colors hover:text-white text-gray-400 flex items-center" id="more-dropdown-btn"',
            'class="nav-link active px-3 py-2 text-sm font-semibold transition-colors text-blue-400 flex items-center" id="more-dropdown-btn"'
        )

    # Perform replacement
    new_content = nav_regex.sub(custom_nav, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print("Updated all navs!")
