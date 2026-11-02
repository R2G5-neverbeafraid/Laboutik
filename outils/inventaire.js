const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,ImageRun,WidthType,ShadingType,BorderStyle,PageOrientation,AlignmentType,VerticalAlign,Header,Footer,PageNumber}=require('docx');
const path=require('path');
const S=process.argv[2]; // dossier de travail (inv.json + miniatures)
const SORTIE=process.argv[3]; // chemin du .docx à écrire
const RACINE=path.join(__dirname,'..');
const rows=JSON.parse(fs.readFileSync(S+'/inv.json','utf8'));
const cfg=JSON.parse(fs.readFileSync(path.join(RACINE,'data/config.json'),'utf8'));
const catNom=Object.fromEntries(cfg.categories.map(c=>[c.id,c.nom]));
const typNom=Object.fromEntries((cfg.types||[]).map(t=>[t.id,t.nom]));
const W=[5600,4100,3600,2138]; // somme 15438
const line={style:BorderStyle.SINGLE,size:4,color:'BBBBBB'}; const borders={top:line,bottom:line,left:line,right:line};
const m={top:70,bottom:70,left:100,right:100};
const t=(text,o={})=>new Paragraph({spacing:{after:30},children:[new TextRun({text,font:'Arial',size:o.size||18,bold:o.bold,color:o.color})]});
const cell=(i,children,o={})=>new TableCell({width:{size:W[i],type:WidthType.DXA},borders,margins:m,verticalAlign:VerticalAlign.CENTER,shading:o.fill?{type:ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,children});
const head=['Photos','Article','Détails','Prix ($)'].map((h,i)=>cell(i,[t(h,{bold:true,color:'FFFFFF',size:20})],{fill:'0E0E0E'}));
const body=rows.map(r=>{
  const imgs=r.thumbs.map(([f,[w,h],c])=>{const H=110,Wd=Math.round(w*H/h);return new ImageRun({type:'jpg',data:fs.readFileSync(f),transformation:{width:Wd,height:H},altText:{title:r.nom,description:r.nom,name:r.id}})});
  const ph=imgs.length?[new Paragraph({spacing:{after:0},children:imgs.flatMap(i=>[i,new TextRun({text:'  '})])})]:[t('Pas de photo',{color:'999999'})];
  const det=[t(`Catégorie : ${catNom[r.categorie]||r.categorie}`),t(`Type : ${typNom[r.type]||r.type}`),t(`Couleurs : ${r.couleurs.length?r.couleurs.join(', '):'à confirmer'}`),t(`Tailles : ${r.tailles.length?r.tailles.join(', '):'—'}`)];
  const art=[t(r.id.toUpperCase(),{size:16,color:'777777'}),t(r.nom,{bold:true,size:20}),...(r.marque?[t(r.marque,{color:'5B6340'})]:[]),t(r.statut==='precommande'?'Pré-commande':r.statut,{size:16,color:'777777'})];
  return new TableRow({cantSplit:true,children:[cell(0,ph),cell(1,art),cell(2,det),cell(3,[t(r.prix!=null?`${r.prix} $`:'',{size:22,bold:true})],{fill:r.prix==null?'FFF8DC':undefined})]});
});
const doc=new Document({
  styles:{default:{document:{run:{font:'Arial',size:20}}}},
  sections:[{properties:{page:{size:{width:11906,height:16838,orientation:PageOrientation.LANDSCAPE},margin:{top:720,bottom:720,left:700,right:700}}},
   footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LA BOUTIQUE · inventaire · page ',size:16,color:'888888'}),new TextRun({children:[PageNumber.CURRENT],size:16,color:'888888'})]})]})},
   children:[
    new Paragraph({spacing:{after:60},children:[new TextRun({text:'LA BOUTIQUE — Inventaire des articles du site',bold:true,size:36})]}),
    new Paragraph({spacing:{after:200},children:[new TextRun({text:`${rows.length} articles en ligne sur le site au ${new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})} · ${rows.filter(r=>r.prix!=null).length} avec prix, ${rows.filter(r=>r.prix==null).length} à fixer (case jaune). Les photos viennent de captures de sites revendeurs : à remplacer par des photos officielles avant la mise en ligne publique.`,size:20,color:'555555'})]}),
    new Table({width:{size:15438,type:WidthType.DXA},columnWidths:W,rows:[new TableRow({tableHeader:true,children:head}),...body]})
   ]}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(SORTIE,b);console.log('ok',b.length)});
