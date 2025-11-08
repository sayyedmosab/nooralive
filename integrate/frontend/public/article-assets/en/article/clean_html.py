import re
import os
import sys

def clean_html(content):
    # Remove <!DOCTYPE html>
    content = re.sub(r'<!DOCTYPE html>', '', content)
    # Remove <html>, <body>, <head> tags, but keep their content.
    content = re.sub(r'<html[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</html>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<head[^>]*>.*?</head>', '', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<body[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</body>', '', content, flags=re.IGNORECASE)

    # Remove MS Office meta tags and links
    content = re.sub(r'<meta content="Word.Document"[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name=ProgId content=Word.Document>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name=Generator content="Microsoft Word 15">', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name=Originator content="Microsoft Word 15">', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel=File-List href="[^"]*">', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel=Edit-Time-Data href="[^"]*">', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel=themeData href="[^"]*">', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel=colorSchemeMapping href="[^"]*">', '', content, flags=re.IGNORECASE)


    # Remove conditional comments
    content = re.sub(r'<!--\[if gte vml 1\]>.*?<!\[endif\]-->', '', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<\?if !supportLists\?>.*?</\?if\?>', '', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<\?if !vml\?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<\?endif\?>', '', content, flags=re.IGNORECASE)


    # Remove XML namespaces
    content = re.sub(r'\s*xmlns:[a-z]+="[^"]*"', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*xmlns:v="[^"]*"', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*xmlns:o="[^"]*"', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*xmlns:w="[^"]*"', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*xmlns:m="[^"]*"', '', content, flags=re.IGNORECASE)


    # Remove v: and o: tags
    content = re.sub(r'</?[vo]:[^>]*>', '', content, flags=re.IGNORECASE)


    # Remove Mso classes
    content = re.sub(r'\s*class="?Mso[a-zA-Z0-9]*"?', '', content, flags=re.IGNORECASE)

    # Remove mso- styles
    content = re.sub(r'\s*style="[^ vital]*mso-[^ vital]*"', '', content, flags=re.IGNORECASE)
    
    # Remove language and proofing attributes
    content = re.sub(r'\s*lang=[a-zA-Z-]+', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-bidi-[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-fareast-[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-ansi-[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-font-kerning:[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-ligatures:[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-no-proof:[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*mso-special-character:[^ vital]*\'', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*style=\'[^ vital]*page-break-before:[^ vital]*\'', '', content, flags=re.IGNORECASE)
    
    # Remove <span class="GramE"> and its closing tag
    content = re.sub(r'<span class="?GramE"?>(.*?)</span>', r'\1', content, flags=re.IGNORECASE)
    
    # Remove empty tags
    content = re.sub(r'<p[^>]*>\s*(&nbsp;)?\s*</p>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<h[1-6][^>]*>\s*(&nbsp;)?\s*</h[1-6]>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<div[^>]*>\s*(&nbsp;)?\s*</div>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<span[^>]*>\s*(&nbsp;)?\s*</span>', '', content, flags=re.IGNORECASE)

    # Remove all attributes from span tags
    content = re.sub(r'<span[^>]*>', '<span>', content, flags=re.IGNORECASE)

    # Remove empty style attributes
    content = re.sub(r'\s*style=""', '', content, flags=re.IGNORECASE)

    # Normalize whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'>\s+<', '><', content)
    
    return content.strip()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for file_path in sys.argv[1:]:
            if os.path.exists(file_path) and file_path.endswith('.html'):
                with open(file_path, "r", encoding="utf-8") as f:
                    original_content = f.read()
                
                cleaned_content = clean_html(original_content)
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(cleaned_content)
                
                print(f"Cleaned {file_path}")
    else:
        print("Please provide at least one HTML file path to clean.")