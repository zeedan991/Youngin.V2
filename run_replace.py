import os, re

count = 0
for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(r'\$([0-9]+(?:\.[0-9]+)?)', r'₹\1', content)
            
            # common occurrences
            new_content = new_content.replace('Value: $', 'Value: ₹')
            new_content = new_content.replace('value: "$', 'value: "₹')
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f'Updated {path}')
print(f'Total files updated: {count}')
