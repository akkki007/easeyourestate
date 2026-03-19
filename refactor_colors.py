import os
import re
import glob

color_map = {
    'purple': 'primary',
    'blue': 'primary',
    'indigo': 'primary',
    'teal': 'primary',
    'violet': 'primary',
    'red': 'error',
    'rose': 'error',
    'green': 'success',
    'emerald': 'success',
    'yellow': 'warning',
    'amber': 'warning',
    'orange': 'warning',
    'sky': 'info',
    'cyan': 'info'
}

def process_file(filepath):
    print(f"Processing colors in {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # regex for prefix-color-(number|number/number)
    # prefixes: text, bg, border, ring, divide, shadow, fill, stroke, hover:bg, hover:text, etc.
    # basically match: \b([a-zA-Z0-9:-]+)-([a-z]+)-(\d+(?:/\d+)?)\b
    def replacer(match):
        prefix = match.group(1)
        color = match.group(2)
        
        # If the color is in our map, we map it
        if color in color_map:
            semantic_color = color_map[color]
            return f"{prefix}-{semantic_color}"
        
        return match.group(0)

    # Replace colors
    content = re.sub(r'\b([a-zA-Z0-9:-]+)-(purple|blue|indigo|teal|violet|red|rose|green|emerald|yellow|amber|orange|sky|cyan)-\d+(?:/\d+)?\b', replacer, content)

    # Some manual fixes: text-white -> text-primary-foreground or text-background
    # Since text-white inside bg-primary is standard, we replace text-white with text-primary-foreground
    content = re.sub(r'\btext-white\b', 'text-primary-foreground', content)
    # the same for bg-black/bg-black/40 -> bg-black -> bg-foreground ? The prompt said NO hardcoded bg-white, bg-black might be used heavily for overlays. We will leave black overlays as bg-foreground/50 but wait, bg-black/40 is standard. Let's just remove text-white.

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    base_dir = r"d:\Programming\RealEstateProject\easeyourestate"
    targets = ['components/**/*.tsx', 'components/**/*.ts', 'app/**/*.tsx', 'app/**/*.ts']
    
    for target in targets:
        for filepath in glob.glob(os.path.join(base_dir, target), recursive=True):
            if 'node_modules' in filepath or '.next' in filepath:
                continue
            process_file(filepath)

if __name__ == "__main__":
    main()
