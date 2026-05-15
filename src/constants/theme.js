export const C = {
  bg: "#0a0806",
  bgCard: "#110d09",
  bgEl: "#1a130d",
  accent: "#c9956c",
  accentL: "#e8c4a0",
  accentD: "#7a5a3c",
  rose: "#a03058",
  roseL: "#c8507a",
  cream: "#f0e6d3",
  creamD: "#9a8878",
  border: "rgba(201,149,108,0.15)",
  borderH: "rgba(201,149,108,0.4)",
  gold: "#d4af7a",
};

export const FS = "'Cormorant Garamond', Georgia, serif";
export const FB = "'Nunito', 'Segoe UI', sans-serif";

export const GS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@300;400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:100%;height:100%;overflow-x:hidden;}
html{scroll-behavior:smooth;}
body{position:relative;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0a0806;}
::-webkit-scrollbar-thumb{background:#3a2a1a;border-radius:3px;}
@media(max-width:768px){::-webkit-scrollbar{width:0;}body{overflow-x:hidden;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes menuSlideIn{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
.fadeUp{animation:fadeUp .65s ease both;}
.menuSlideIn{animation:menuSlideIn .4s ease both;}
.d1{animation-delay:.05s;}.d2{animation-delay:.1s;}.d3{animation-delay:.15s;}.d4{animation-delay:.2s;}.d5{animation-delay:.25s;}.d6{animation-delay:.3s;}.d7{animation-delay:.35s;}
.card-hover{transition:transform .3s ease,box-shadow .3s ease;}
.card-hover:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(201,149,108,.18);}
.btn-p{background:linear-gradient(135deg,#c9956c,#7a5a3c);color:#f5ede3;border:none;padding:11px 26px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;transition:all .3s;border-radius:1px;}
.btn-p:hover{background:linear-gradient(135deg,#e8c4a0,#c9956c);}
.btn-s{background:transparent;color:#c9956c;border:1px solid rgba(201,149,108,.45);padding:10px 24px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;transition:all .3s;border-radius:1px;}
.btn-s:hover{border-color:#c9956c;color:#e8c4a0;}
.btn-danger{background:rgba(160,48,88,.15);color:#c8507a;border:1px solid rgba(160,48,88,.3);padding:7px 16px;cursor:pointer;font-size:.8rem;letter-spacing:.05em;transition:all .3s;border-radius:1px;font-family:'Nunito',sans-serif;}
.btn-danger:hover{background:rgba(160,48,88,.3);}
.inp{background:rgba(255,255,255,.04);border:1px solid rgba(201,149,108,.18);color:#f5ede3;padding:11px 15px;font-family:'Nunito',sans-serif;font-size:.9rem;width:100%;outline:none;transition:border-color .3s;border-radius:1px;}
.inp:focus{border-color:#c9956c;}
.inp option{background:#1a130d;}
label{display:block;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:#9a8878;margin-bottom:6px;}
`;