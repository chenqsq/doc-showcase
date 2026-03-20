import fitz
import os

pdf_dir = r'F:\笔记\OneDrive\桌面\比赛\腾讯平台使用文档'
for filename in os.listdir(pdf_dir):
    if filename.endswith('.pdf'):
        filepath = os.path.join(pdf_dir, filename)
        print(f'=== {filename} ===')
        try:
            doc = fitz.open(filepath)
            print(f'总页数：{len(doc)}')
            for page_num in range(min(len(doc), 15)):
                page = doc[page_num]
                text = page.get_text()
                if text.strip():
                    print(f'--- 第{page_num+1}页 ---')
                    print(text)
            doc.close()
        except Exception as e:
            print(f'错误：{e}')
        print('\n' + '='*50 + '\n')
