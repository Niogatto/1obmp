#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Збирає публічний каталог з окремих папок вакансій та дайджесту.

Запуск із кореня сайту: python build_catalog.py
Скрипт використовує лише стандартну бібліотеку Python.
Файл data/catalog.js можна підключати з file:// без CORS-помилок.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'data' / 'catalog.js'
SECTIONS = {'vacancies': 'jobs', 'digest': 'posts'}


def read_section(folder_name):
    """Читає content.json кожної публікації, перевіряє ID та фото."""
    records = []
    base = ROOT / folder_name
    for folder in sorted(base.iterdir() if base.exists() else []):
        if not folder.is_dir() or not (folder / 'content.json').exists():
            continue
        item = json.loads((folder / 'content.json').read_text(encoding='utf-8'))
        if item.get('id') != folder.name or not re.fullmatch(r'[a-z0-9][a-z0-9-]*', folder.name):
            raise ValueError(f'ID має відповідати назві папки: {folder}')
        # Не включаємо чернетки до публічного каталогу.
        if item.get('status') == 'draft' or item.get('published') is False:
            continue
        # У каталог потрапляють лише наявні локальні файли фотографій.
        # Якщо cover відсутній, фото-блок не буде створено.
        def image_path(filename):
            if not filename:
                return ''
            if not isinstance(filename, str) or '/' in filename or chr(92) in filename or filename.startswith('.'):
                raise ValueError(f'Некоректне ім’я фотографії у {folder}')
            file = folder / 'images' / filename
            if not file.is_file():
                print(f'Увага: фото не знайдено: {file.relative_to(ROOT)}')
                return ''
            return file.relative_to(ROOT).as_posix()
        item['cover'] = image_path(item.get('cover', ''))
        item['gallery'] = [path for name in item.get('gallery', []) if (path := image_path(name))]
        records.append(item)
    return records


def main():
    catalog = {key: read_section(section) for section, key in SECTIONS.items()}
    OUTPUT.parent.mkdir(exist_ok=True)
    # Захищаємо вбудований JS від небажаного завершення тегу script.
    payload = json.dumps(catalog, ensure_ascii=False, indent=2).replace('<', r'\u003c')
    OUTPUT.write_text('/* Автоматично створено build_catalog.py. Не редагуйте вручну. */\n'.replace('\n','\n') + 'window.SITE_CONTENT = ' + payload + ';\n', encoding='utf-8')
    print(f"Каталог оновлено: {len(catalog['jobs'])} вакансій, {len(catalog['posts'])} публікацій")


if __name__ == '__main__':
    main()
