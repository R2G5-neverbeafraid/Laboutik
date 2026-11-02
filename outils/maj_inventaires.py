#!/usr/bin/env python3
"""Régénère les deux fichiers de suivi du catalogue (dossier interne/, non publié) :
  - interne/LA_BOUTIQUE_inventaire.docx : inventaire des articles du site (photos, détails, prix)
  - interne/LA_BOUTIQUE_prix.xlsx       : prix de chaque article, classés par marque (+ résumé par marque)
À lancer après CHAQUE modification de data/produits.json :  python3 outils/maj_inventaires.py
Dépendances : Pillow, openpyxl, Node + paquet npm « docx »."""
import json, os, re, subprocess, sys, tempfile
from PIL import Image
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INTERNE = os.path.join(RACINE, 'interne')
os.makedirs(INTERNE, exist_ok=True)
produits = json.load(open(os.path.join(RACINE, 'data/produits.json'), encoding='utf-8'))['produits']

# ---------- 1. Inventaire Word ----------
tmp = tempfile.mkdtemp(prefix='inv_')
lignes = []
for p in produits:
    miniatures = []
    for k, ph in enumerate(p['photos']):
        src = ph if isinstance(ph, str) else ph['src']
        im = Image.open(os.path.join(RACINE, src)).convert('RGB')
        im.thumbnail((200, 250))
        out = os.path.join(tmp, f"{p['id']}-{k}.jpg")
        im.save(out, quality=72)
        miniatures.append([out, list(im.size), None])
    lignes.append({**{k: p[k] for k in ('id', 'nom', 'categorie', 'type', 'marque', 'prix', 'couleurs', 'tailles', 'statut')}, 'thumbs': miniatures})
json.dump(lignes, open(os.path.join(tmp, 'inv.json'), 'w', encoding='utf-8'), ensure_ascii=False)
sortie_docx = os.path.join(INTERNE, 'LA_BOUTIQUE_inventaire.docx')
subprocess.run(['node', os.path.join(RACINE, 'outils/inventaire.js'), tmp, sortie_docx], check=True)

# ---------- 2. Prix par marque (Excel) ----------
def groupe(x):
    b = (x.get('marque') or '').strip()
    if not b:
        return 'Sans marque'
    return re.split(r'\s*(?:×|/|\()\s*', b)[0].strip() or b  # « Nike × Syna World » → Nike
for x in produits:
    x['g'] = groupe(x)
groupes = {}
for x in produits:
    groupes.setdefault(x['g'], []).append(x)
ordre = sorted([g for g in groupes if g != 'Sans marque'], key=str.casefold) + (['Sans marque'] if 'Sans marque' in groupes else [])

wb = Workbook(); ws = wb.active; ws.title = 'Prix par marque'
ws.append(['Marque', 'Article', 'Code', 'Prix ($)', 'Détail marque'])
noir = PatternFill('solid', fgColor='0E0E0E'); fin = Side(style='thin', color='DDDDDD'); epais = Side(style='medium', color='0E0E0E')
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF', name='Arial'); c.fill = noir
fonds = [PatternFill('solid', fgColor='F4F4F1'), PatternFill(fill_type=None)]
r = 2
for gi, g in enumerate(ordre):
    for k, x in enumerate(sorted(groupes[g], key=lambda x: x['nom'].casefold())):
        ws.append([g, x['nom'], x['id'].upper(), x['prix'] if x['prix'] is not None else 'à fixer',
                   x['marque'] if (x.get('marque') and x['marque'] != g) else ''])
        for c in ws[r]:
            c.font = Font(name='Arial', size=10, bold=(c.column == 1 and k == 0) or c.column == 4)
            c.fill = fonds[gi % 2]
            c.alignment = Alignment(vertical='center', wrap_text=(c.column == 2))
            c.border = Border(top=epais if k == 0 else None, bottom=fin)
        ws.cell(r, 4).number_format = '0" $"'
        ws.cell(r, 4).alignment = Alignment(horizontal='right', vertical='center')
        if x['prix'] is None:
            ws.cell(r, 4).fill = PatternFill('solid', fgColor='FFE9A8')
        r += 1
n = r - 1
for i, w in enumerate([22, 70, 10, 10, 30], 1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'A2'; ws.auto_filter.ref = f'A1:E{n}'

s = wb.create_sheet('Résumé par marque')
s.append(['Marque', 'Articles', 'Avec prix', 'Prix min ($)', 'Prix max ($)', 'Prix moyen ($)'])
for c in s[1]:
    c.font = Font(bold=True, color='FFFFFF', name='Arial'); c.fill = noir
R = lambda col: f"'Prix par marque'!${col}$2:${col}${n}"
for i, g in enumerate(ordre, 2):
    pr = [x['prix'] for x in groupes[g] if x['prix'] is not None]
    s.append([g, f'=COUNTIF({R("A")},A{i})', f'=COUNTIFS({R("A")},A{i},{R("D")},">0")',
              min(pr) if pr else '—', max(pr) if pr else '—', f'=IFERROR(ROUND(AVERAGEIFS({R("D")},{R("A")},A{i}),1),"—")'])
t = len(ordre) + 2
s.append(['Total', f'=SUM(B2:B{t-1})', f'=SUM(C2:C{t-1})', f'=MIN({R("D")})', f'=MAX({R("D")})', f'=ROUND(AVERAGE({R("D")}),1)'])
for row in s.iter_rows(min_row=2, max_row=t):
    for c in row:
        c.font = Font(name='Arial', size=10, bold=(row[0].row == t)); c.border = Border(bottom=fin)
    for c in row[1:]:
        c.alignment = Alignment(horizontal='right')
for i, w in enumerate([24, 10, 11, 13, 13, 15], 1):
    s.column_dimensions[get_column_letter(i)].width = w
s.freeze_panes = 'A2'
sortie_xlsx = os.path.join(INTERNE, 'LA_BOUTIQUE_prix.xlsx')
wb.save(sortie_xlsx)
print(f'OK : {len(produits)} articles → {sortie_docx} et {sortie_xlsx}')
