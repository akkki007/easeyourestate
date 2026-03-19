import os
import re
import glob

def process_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
        
    # Remove dark classes
    content = re.sub(r'(?<![a-zA-Z0-9\-])dark:[a-zA-Z0-9\-\/\[\]#%:]+', '', content)
    
    # Text colors
    content = re.sub(r'(?<![a-zA-Z0-9\-])text-gray-[789]00\b', 'text-foreground', content)
    content = re.sub(r'(?<![a-zA-Z0-9\-])text-black\b', 'text-foreground', content)
    content = re.sub(r'(?<![a-zA-Z0-9\-])text-gray-[456]00\b', 'text-muted-foreground', content)
    content = re.sub(r'(?<![a-zA-Z0-9\-])text-gray-300\b', 'text-muted-foreground', content)

    # Border colors
    content = re.sub(r'(?<![a-zA-Z0-9\-])border-gray-\d+\b', 'border-border', content)
    
    # Hover states
    content = re.sub(r'(?<![a-zA-Z0-9\-])hover:bg-gray-\d+\b', 'hover:bg-accent', content)
    
    # Backgrounds
    content = re.sub(r'(?<![a-zA-Z0-9\-])bg-white\b', 'bg-card', content)
    content = re.sub(r'(?<![a-zA-Z0-9\-])bg-gray-50\b', 'bg-background', content)
    content = re.sub(r'(?<![a-zA-Z0-9\-])bg-gray-\d+\b', 'bg-muted', content)

    # Clean up double spaces caused by removing dark classes
    content = re.sub(r' +', ' ', content)
    content = content.replace(' "', '"').replace('" ', '"')
    content = content.replace(" '", "'").replace("' ", "'")
    content = content.replace(" `", "`").replace("` ", "`")
    
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
