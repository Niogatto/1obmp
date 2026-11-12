"""Перебудова локального списку фото. Працює без сервера і fetch()."""
from pathlib import Path
import re, json
folder=Path(__file__).parent/'images'/'history'
photos=[p.name for p in folder.iterdir() if p.suffix.lower() in ('.png','.jpg','.jpeg','.webp','.avif') and p.name.lower()!='ff.png']
photos.sort(key=lambda n:(0,int(re.match(r'^\d+',n).group()),n) if re.match(r'^\d+',n) else (1,0,n))
(folder/'photos.js').write_text('window.HISTORY_PHOTOS = '+json.dumps(photos,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Історичні фото:',len(photos))
