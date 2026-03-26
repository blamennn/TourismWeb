const fs = require('fs');
const path = 'c:/Users/BLAMEN/OneDrive/Desktop/TourismWebsite/';

let idx = fs.readFileSync(path + 'index.html', 'utf8');
let abt = fs.readFileSync(path + 'about.html', 'utf8');

// EXTRACT CSS
const cssStartStr = '    /* ══ MOTOURISM INTRO BAND ══ */';
const cssEndStr = '    /* ══ LOCAL TRAVELLERS ══ */';
const cssStart = idx.indexOf(cssStartStr);
const cssEnd = idx.indexOf(cssEndStr);

let motoCss = '';
if (cssStart !== -1 && cssEnd !== -1) {
  motoCss = idx.substring(cssStart, cssEnd);
  idx = idx.substring(0, cssStart) + idx.substring(cssEnd);
}

// Ensure .btn-teal exists in motoCss since it might be missing in index CSS but used in HTML
if (!motoCss.includes('.btn-teal')) {
  motoCss += `    .btn-teal { display: inline-block; background: #1a9a7a; color: #fff; font-weight: 600; font-size: 0.9rem; padding: 13px 28px; border-radius: 4px; transition: all .2s; }
    .btn-teal:hover { background: #22b890; transform: translateY(-2px); }\n\n`;
}

// EXTRACT HTML
const htmlStartStr = '  <!-- ══ MOTOURISM INTRO BAND ══ -->';
const htmlEndStr = '  <!-- ══ LOCAL TRAVELLERS ══ -->';
const htmlStart = idx.indexOf(htmlStartStr);
const htmlEnd = idx.indexOf(htmlEndStr);

let motoHtml = '';
if (htmlStart !== -1 && htmlEnd !== -1) {
  motoHtml = idx.substring(htmlStart, htmlEnd);
  idx = idx.substring(0, htmlStart) + idx.substring(htmlEnd);
}

// EXTRACT JS
const jsStartStr = '    function switchRoute';
const jsEndStr = '    }\n';
const jsStart = idx.indexOf(jsStartStr);

let motoJs = '';
if (jsStart !== -1) {
  let tempEnd = idx.indexOf('</script>', jsStart);
  if (tempEnd === -1) tempEnd = idx.indexOf(jsEndStr, jsStart) + jsEndStr.length;
  motoJs = idx.substring(jsStart, tempEnd);
  idx = idx.substring(0, jsStart) + idx.substring(tempEnd);
}

// INSERT INTO ABOUT.HTML
const abtCssPos = abt.indexOf('    /* ?? CTA FOOTER BAND ?? */');
if (abtCssPos !== -1 && motoCss) {
  abt = abt.substring(0, abtCssPos) + motoCss + abt.substring(abtCssPos);
}

const abtHtmlPos = abt.indexOf('  <!-- ?? CTA FOOTER BAND ?? -->');
if (abtHtmlPos !== -1 && motoHtml) {
  abt = abt.substring(0, abtHtmlPos) + motoHtml + abt.substring(abtHtmlPos);
}

if (motoJs && !abt.includes('switchRoute')) {
  const bodyEnd = abt.lastIndexOf('</body>');
  if (bodyEnd !== -1) {
    abt = abt.substring(0, bodyEnd) + '  <script>\n' + motoJs + '  </script>\n' + abt.substring(bodyEnd);
  }
}

// UPDATE LINKS IN ALL FILES
function updateLinks(content, target) {
  return content.replace(/<a href=\"index\.html#motourism\">Motourism<\/a>/g, '<a href=\"' + target + '\">Motourism</a>')
                .replace(/<a href=\"#motourism\">Motourism<\/a>/g, '<a href=\"' + target + '\">Motourism</a>')
                .replace(/<a href=\"motourism\.html\">Motourism<\/a>/g, '<a href=\"' + target + '\">Motourism</a>');
}

idx = updateLinks(idx, 'about.html#motourism');
abt = updateLinks(abt, '#motourism');

const filesToUpdate = ['attractions.html', 'gallery.html', 'contact.html'];
for (const file of filesToUpdate) {
  try {
    let content = fs.readFileSync(path + file, 'utf8');
    content = updateLinks(content, 'about.html#motourism');
    fs.writeFileSync(path + file, content, 'utf8');
  } catch (e) {
    console.error('Failed to update: ' + file);
  }
}

fs.writeFileSync(path + 'index.html', idx, 'utf8');
fs.writeFileSync(path + 'about.html', abt, 'utf8');
console.log('Migration completed successfully!');
