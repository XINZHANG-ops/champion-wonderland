(function (root) {
  'use strict';
  const themes = {
    he: {label:'Higher Education',building:'university',roof:'#397969'},
    corp: {label:'Corporate World',building:'office',roof:'#507873'},
    k12: {label:'K–12',building:'school',roof:'#687b98'},
    public: {label:'Government & Public Sector',building:'civic',roof:'#587c72'},
    hq: {label:'D2L HQ',building:'headquarters',roof:'#dd7a32'}
  };
  const windowPane = (x,y,w=45,h=66) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w/2}" fill="#b5d6cf" stroke="#fff6dc" stroke-width="8"/><path d="M${x+w/2} ${y+4}v${h-8}M${x+3} ${y+h*.56}h${w-6}" stroke="#fff6dc" stroke-width="4"/>`;
  const tree = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="5" rx="58" ry="14" fill="#517a46" opacity=".14"/><path d="M-8 0l3-110h14L7 0z" fill="#a47b4e"/><path d="M0-55l-30-30M3-74l24-25" stroke="#a47b4e" stroke-width="8"/><g fill="#679b4e"><path d="M-63-99l18-43 48-14 43 28 14 46-28 22-55-7z"/><path d="M-68-112l14-39 35-19 21 34-19 33z" fill="#8cb854"/><path d="M-13-144l28-30 37 18 17 40-29 25-36-18z" fill="#a3c55a"/><path d="M-50-83l22-32 36 10 19 37-32 12z" fill="#74aa50"/><path d="M24-85l16-32 35 13-6 34-31 7z" fill="#80b14e"/></g></g>`;
  const flowers = (x,y) => `<g transform="translate(${x} ${y})"><path d="M0 0v-21M20 4v-24M43 0v-26" stroke="#5b944a" stroke-width="3"/><g fill="#f6c74e"><circle cx="0" cy="-23" r="8"/><circle cx="43" cy="-28" r="8"/></g><circle cy="-23" r="3" fill="#a47731"/><circle cx="43" cy="-28" r="3" fill="#a47731"/><circle cx="20" cy="-22" r="7" fill="#f4a486"/></g>`;
  const shrubs = (x,y) => `<g transform="translate(${x} ${y})"><ellipse rx="54" ry="19" fill="#57954d"/><ellipse cx="-20" cy="-10" rx="25" ry="22" fill="#85b35b"/><ellipse cx="20" cy="-9" rx="30" ry="21" fill="#6da650"/>${flowers(-17,-4)}</g>`;
  function building(theme) {
    if (theme.building==='office' || theme.building==='headquarters') {
      const hq=theme.building==='headquarters';
      return `<g transform="translate(83 143)"><path d="M20 120L365 100 457 150 114 171z" fill="#f1eadb"/><path d="M20 120v225l344 7V100z" fill="#fff7e7"/><path d="M364 100l94 50v211l-94-9z" fill="#dcccb5"/><rect x="45" y="159" width="292" height="156" fill="#7caaa4"/><path d="M45 159l90 156h58L101 159z" fill="#bedbd1" opacity=".6"/><path d="M141 160v155M239 159v156M46 235h291" stroke="#e9ddc7" stroke-width="12"/><path d="M38 322h310v23H38zM15 112h356v22H15z" fill="#ded3bb"/><path d="M366 112l101 48v19l-101-45z" fill="#d0c0a6"/><path d="M73 115v205M88 115v205M103 115v205" stroke="#b88c55" stroke-width="7"/><path d="M256 282h60v64h-60z" fill="#355f56"/><path d="M259 287l-24 9v53l24-5z" fill="#5f8e80"/><rect x="187" y="124" width="146" height="30" rx="3" fill="${hq?'#e9832a':'#315f53'}"/><text x="260" y="145" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#fff9ea">${hq?'D2L HQ':'CORPORATE'}</text><path d="M174 88l108-9 34 18-107 8z" fill="#547a8c" stroke="#c0d0cf" stroke-width="3"/><path d="M180 91l109-9M194 86l30 17M232 84l29 16" stroke="#9bb7c4" stroke-width="2"/><path d="M39 344h308v16H39zM48 360h286v15H48z" fill="#d4c5ab"/><rect x="53" y="329" width="98" height="25" rx="3" fill="#ceb38c"/><path d="M62 331l3-27 17 12 12-22 14 24 20-16 12 29" fill="#72a45a"/></g>`;
    }
    if (theme.building==='school') return `<g transform="translate(108 219)"><path d="M0 80h390v185H0z" fill="#f0bf76"/><path d="M-18 89l75-90 329 9 35 85z" fill="${theme.roof}"/><path d="M137 74V18l61-58 68 61v244H137z" fill="#ffe3a7"/><path d="M128 26l70-67 77 68" fill="none" stroke="#fff5da" stroke-width="12"/><circle cx="201" cy="53" r="29" fill="#fff9e5" stroke="#cc9c55" stroke-width="5"/><path d="M201 34v19l13 8" fill="none" stroke="#796b4f" stroke-width="4"/>${windowPane(32,118,48,75)}${windowPane(310,118,48,75)}<rect x="176" y="172" width="54" height="93" fill="#a0794e"/><path d="M180 172l-19 10v83l19-2" fill="#ba915c"/><rect x="155" y="125" width="95" height="32" rx="3" fill="#386454"/><text x="203" y="149" text-anchor="middle" font-family="Arial" font-size="22" fill="#fff9ea">K–12</text><path d="M8 252h111v18H8zM280 252h110v18H280z" fill="#cca779"/>${flowers(33,251)}${flowers(304,251)}<path d="M13 285h111M13 316h111M262 285h76M262 316h76" stroke="#fff5dc" stroke-width="8"/>${[16,50,84,118,268,302,336].map(x=>`<path d="M${x} 275v54" stroke="#fff5dc" stroke-width="13"/>`).join('')}</g>`;
    const civic=theme.building==='civic';
    return `<g transform="translate(98 171)"><path d="M7 90h384v235H7z" fill="#ead7b6"/><path d="M391 90l62-20v234l-62 21z" fill="#d0bc98"/><path d="M-13 95l70-90h352l57 72-72 22z" fill="${theme.roof}"/><path d="M41 24h351L335 0H62z" fill="#5e9480"/><path d="M135 95V52l62-51 67 53v271H135z" fill="#f8ead1"/><path d="M124 59l72-60 78 60" fill="none" stroke="#fff5dc" stroke-width="10"/>${windowPane(41,135,49,80)}${windowPane(303,135,49,80)}${windowPane(177,69,40,57)}<path d="M166 322v-82a31 31 0 0162 0v82z" fill="#ac8251" stroke="#fef5de" stroke-width="8"/><path d="M196 211v112" stroke="#805e39" stroke-width="3"/><rect x="126" y="150" width="148" height="31" rx="3" fill="#315f53"/><text x="200" y="171" text-anchor="middle" font-family="Arial" font-size="${civic?16:17}" font-weight="bold" fill="#fff9ea">${civic?'CIVIC GARDEN':'UNIVERSITY'}</text>${civic?[46,102,287,344].map(x=>`<path d="M${x} 236v82" stroke="#fff4dc" stroke-width="15"/>`).join(''):''}<path d="M126 325h149v13H126zM114 338h173v13H114zM101 351h199v13H101z" fill="#d3c3a6"/><path d="M16 245v70M25 222l-7 18 14 12-11 17 11 12-14 19" fill="none" stroke="#729751" stroke-width="12"/></g>`;
  }
  const entrances={he:[298,535],corp:[368,518],k12:[311,548],public:[298,535],hq:[368,518]};
  function road(world) {
    const [x,y]=entrances[world];
    const garden=world==='k12'?'<path d="M279 484h64v64h-64z" fill="#f5e6c6"/>':'';
    return `<g id="card-road">${garden}<path d="M${x-32} ${y}L${x+32} ${y}C${x+62} ${y+28} 505 ${Math.max(y+12,556)} 586 572C662 615 741 617 802 640L609 640C577 623 530 614 465 607C375 597 ${x-12} ${y+54} ${x-32} ${y}Z" fill="#f5e6c6" stroke="#dccba6" stroke-width="2"/></g>`;
  }
  function background(world) {
    const theme=themes[world];
    if(!theme)throw Error('Unknown card template.');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#d7eee9"/><stop offset="1" stop-color="#fff5dd"/></linearGradient><linearGradient id="grass" x2="0" y2="1"><stop stop-color="#c8dfa0"/><stop offset="1" stop-color="#8fbd71"/></linearGradient></defs><rect width="1000" height="640" fill="url(#sky)"/><circle cx="827" cy="104" r="45" fill="#fff5cf"/><g fill="#fffdf4" opacity=".8"><ellipse cx="672" cy="105" rx="80" ry="16"/><ellipse cx="624" cy="95" rx="35" ry="20"/><ellipse cx="181" cy="74" rx="68" ry="14"/></g><path d="M0 325q120-83 280-1t343-2 377-13v331H0z" fill="#b9d198"/><path d="M0 397q228-93 450-7t550-15v265H0z" fill="url(#grass)"/>${road(world)}${tree(60,401,.85)}${tree(566,364,.68)}${tree(924,395,1.06)}<g id="card-building">${building(theme)}</g><path d="M783 364q107-1 133 55-5 57-113 60-86-16-90-60 9-42 70-55" fill="#c9c6a5"/><path d="M782 376q97-4 121 44-9 46-98 45-75-11-78-43 7-35 55-46" fill="#7abdb4"/><path d="M754 420q60-25 120 2M766 442q43-18 93-1" fill="none" stroke="#c4e7d7" stroke-width="5"/><g fill="#8db269"><ellipse cx="870" cy="426" rx="12" ry="6"/><ellipse cx="763" cy="440" rx="10" ry="5"/></g><circle cx="867" cy="421" r="6" fill="#f7b5ae"/>${shrubs(87,511)}${shrubs(914,517)}${shrubs(728,493)}${tree(44,568,.72)}<path d="M802 562h113v11H802M811 573v18M907 573v18M802 539h113v16H802" stroke="#ac8657" stroke-width="7" fill="#d7b889"/>${flowers(113,584)}${flowers(849,612)}${flowers(690,525)}<g fill="#e7efbc"><path d="M168 547l5-12 4 12zM739 581l5-13 4 13zM925 563l5-14 4 14zM635 479l5-11 4 11z"/></g></svg>`;
  }
  async function draw(canvas,avatar,world) {
    const image=new Image();
    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(background(world));
    await image.decode();
    const c=canvas.getContext('2d');
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);
    c.drawImage(image,0,0,canvas.width,canvas.height);
    const r=Object.create(root.QuestWorldRenderer.prototype);
    r.ctx=c;r.positions=new Map();r.p=()=>[0,0];r.motion=false;
    c.save();c.translate(canvas.width*.50,canvas.height*.91);c.scale(canvas.width/620,canvas.width/620);
    r.character({id:'card',x:0,y:0,avatar:root.QuestWorldData.sanitizeAvatar(avatar),moving:false},0,{large:true});c.restore();
    return canvas.toDataURL('image/png');
  }
  const api={themes,entrances,background,draw};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestCardArt=api;
})(typeof window!=='undefined'?window:globalThis);
