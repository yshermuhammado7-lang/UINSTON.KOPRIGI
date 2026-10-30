const $=id=>document.getElementById(id),
NS="http://www.w3.org/2000/svg",
lab=$("lab");

let pos=80.645,started=false,keyOn=false,dragging=false;
let hiddenRx=generateRandomRx();

function generateRandomRx(){
 return Math.floor(Math.random()*951)+50;
}

function page(id){
 document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
 document.querySelectorAll("nav button[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 $(id).classList.add("active");
}

document.querySelectorAll("nav button[data-page]").forEach(b=>{
 b.onclick=()=>page(b.dataset.page);
});

$("videoInfo").onclick=()=>alert("Video bo‘limi keyin qo‘shiladi.");
$("evalInfo").onclick=()=>alert("O‘zini baholash bo‘limi keyin qo‘shiladi.");
$("resourceInfo").onclick=()=>alert("Resurslar bo‘limi keyin qo‘shiladi.");

for(let i=0;i<=100;i++){
 let x=20+9.6*i,
 l=document.createElementNS(NS,"line");

 l.setAttribute("x1",x);
 l.setAttribute("x2",x);
 l.setAttribute("y1",i%10===0?43:i%5===0?51:59);
 l.setAttribute("y2",70);
 $("topTicks").appendChild(l);

 if(i%10===0){
  let t=document.createElementNS(NS,"text");
  t.setAttribute("x",x);
  t.setAttribute("y",38);
  t.textContent=i;
  $("topNums").appendChild(t);
 }
}

for(let i=0;i<=100;i++){
 let x=130+7.4*i,
 l=document.createElementNS(NS,"line");

 l.setAttribute("x1",x);
 l.setAttribute("x2",x);
 l.setAttribute("y1",i%10===0?363:i%5===0?366:369);
 l.setAttribute("y2",i%10===0?379:374);
 $("bridgeTicks").appendChild(l);

 if(i%10===0){
  let t=document.createElementNS(NS,"text");
  t.setAttribute("x",x);
  t.setAttribute("y",358);
  t.textContent=i;
  $("bridgeNums").appendChild(t);
 }
}

for(let i=-30;i<=30;i+=2){
 let a=i*Math.PI/60,
 l=document.createElementNS(NS,"line");

 l.setAttribute("x1",500+58*Math.sin(a));
 l.setAttribute("y1",511-46*Math.cos(a));
 l.setAttribute("x2",500+67*Math.sin(a));
 l.setAttribute("y2",511-53*Math.cos(a));
 l.setAttribute("stroke","#42494c");
 l.setAttribute("stroke-width",i%10===0?2:1);
 $("gaugeTicks").appendChild(l);
}

function update(v){
 pos=Math.max(.001,Math.min(99.999,Number(v)));

 let S1=pos,
 S2=100-pos,
 R=Math.max(1,Number($("R").value)||1),
 x=130+7.4*pos;

 $("jockey").setAttribute("transform",`translate(${x} 0)`);
 $("bubble").setAttribute("transform",`translate(${x} 0)`);
 $("posText").textContent=pos.toFixed(3);
 $("position").value=pos;
 $("s1Text").textContent=S1.toFixed(3)+" cm";
 $("s2Text").textContent=S2.toFixed(3)+" cm";
 $("bubbleText").textContent=pos.toFixed(3)+" cm";
 $("rLabel").textContent=R+" Ω";

 $("galWireLeft").setAttribute("d",`M431 568 C370 520 320 460 ${x} 386`);
 $("galWireHighlight").setAttribute("d",`M431 568 C370 520 320 460 ${x} 386`);

 // Ko‘prik muvozanat modeli
 const supplyVoltage=2.0;
 const galvanometerResistance=120;
 const calculatedRx=R*S2/S1;
 const resistanceError=hiddenRx-calculatedRx;

 const bridgeVoltage=supplyVoltage*(R*S2-hiddenRx*S1)/
                     ((R+hiddenRx)*100);

 const armEquivalent=(R*hiddenRx)/(R+hiddenRx);
 const totalResistance=galvanometerResistance+armEquivalent+2.0;

 const galvanometerCurrent=bridgeVoltage/totalResistance;
 const currentMilliamp=galvanometerCurrent*1000;

 const angle=Math.max(-30,Math.min(30,currentMilliamp*8));
 const balanced=Math.abs(resistanceError)<=0.5;
 const displayedCurrent=Math.abs(currentMilliamp)<0.0005?0:currentMilliamp;

 $("needle").setAttribute(
  "transform",
  `rotate(${started&&keyOn?angle:0} 500 511)`
 );

 if(!started){
  $("status").textContent="Tajribani boshlang, keyin kalitni ulang.";
 }
 else if(!keyOn){
  $("status").textContent="Kalit ochiq. Tok oqmayapti — kalitni ulang.";
 }
 else if(balanced){
  $("status").innerHTML=
   "<span class='ok'>✓ MUVOZANAT TOPILDI</span><br>"+
   "Galvanometr toki: 0 ga yaqin<br>"+
   "Rₓ / R = S₂ / S₁. Endi S₁ va S₂ qiymatlarini formulaga qo‘ying.";
 }
 else{
  $("status").innerHTML=
   "<span class='bad'>Muvozanat hali topilmadi</span><br>"+
   "Galvanometr toki: "+displayedCurrent.toFixed(3)+" mA<br>"+
   "Kontaktni sekin surib, strelkani nolga yaqinlashtiring.";
 }

 $("needle").style.opacity=started&&keyOn?1:.55;
}

// YANGI FUNKSIYA: aniq muvozanat nuqtasini hisoblash va kontaktni olib borish
function findBalancePoint(){

 if(!started){
  $("status").textContent="Avval ‘Tajribani boshlash’ tugmasini bosing.";
  return;
 }

 const R=Math.max(1,Number($("R").value)||1);

 // Rₓ / R = S₂ / S₁
 // S₁ + S₂ = 100 cm
 // Shundan S₁ = 100 * R / (R + Rₓ)
 const exactS1=(100*R)/(R+hiddenRx);
 const exactS2=100-exactS1;

 // Kontaktni nazariy muvozanat nuqtasiga olib boramiz
 update(exactS1);

 // Hisoblangan nuqtani foydalanuvchiga ko‘rsatamiz.
 $("balanceResult").style.display="block";
 $("balanceResult").innerHTML=
  "<strong>✓ Muvozanat nuqtasi hisoblandi</strong><br>"+
  "S₁ = <b>"+exactS1.toFixed(3)+" cm</b><br>"+
  "S₂ = <b>"+exactS2.toFixed(3)+" cm</b><br>"+
  "Kontakt shu nuqtaga olib kelindi.";

 if(keyOn){
  $("status").innerHTML=
   "<span class='ok'>✓ NAZARIY MUVOZANAT HOLATI</span><br>"+
   "Kontakt muvozanat nuqtasiga keltirildi.<br>"+
   "Galvanometr toki: 0 ga yaqin.";
 }else{
  $("status").textContent=
   "Kontakt muvozanat nuqtasiga keltirildi. Galvanometrni ko‘rish uchun kalitni ulang.";
 }
}

function toggleKey(){
 if(!started){
  $("status").textContent="Avval ‘Tajribani boshlash’ tugmasini bosing.";
  return;
 }

 keyOn=!keyOn;

 $("switchArm").setAttribute(
  "d",
  keyOn?"M775 481L850 481":"M775 481L824 454"
 );

 $("key").textContent=keyOn?"🔌 Kalitni uzish":"🔌 Kalitni ulash";
 update(pos);
}

$("start").onclick=()=>{
 hiddenRx=generateRandomRx();
 started=true;
 keyOn=false;

 $("switchArm").setAttribute("d","M775 481L824 454");
 $("key").textContent="🔌 Kalitni ulash";

 // Yangi tajriba boshlanganida oldingi natijani yashirish
 $("balanceResult").style.display="none";
 $("balanceResult").innerHTML="";

 update(pos);

 $("status").textContent=
  "Yangi tajriba boshlandi. Kalitni ulang va kontaktni qo‘lda suring.";
};

$("key").onclick=toggleKey;

// Yangi tugma hodisasi
$("findBalance").onclick=findBalancePoint;

$("reset").onclick=()=>{
 pos=80.645;
 started=false;
 keyOn=false;

 $("R").value=500;
 $("switchArm").setAttribute("d","M775 481L824 454");
 $("key").textContent="🔌 Kalitni ulash";

 $("balanceResult").style.display="none";
 $("balanceResult").innerHTML="";

 update(pos);
};

$("position").oninput=()=>{
 $("balanceResult").style.display="none";
 update($("position").value);
};

$("R").oninput=()=>{
 $("balanceResult").style.display="none";
 update(pos);
};

function dragMove(e){
 let pt=lab.createSVGPoint();
 pt.x=e.clientX;
 pt.y=e.clientY;

 let p=pt.matrixTransform(lab.getScreenCTM().inverse());

 $("balanceResult").style.display="none";
 update((p.x-130)/7.4);
}

$("jockey").addEventListener("pointerdown",e=>{
 dragging=true;
 $("jockey").setPointerCapture(e.pointerId);
 dragMove(e);
 e.preventDefault();
});

$("jockey").addEventListener("pointermove",e=>{
 if(dragging)dragMove(e);
});

$("jockey").addEventListener("pointerup",()=>dragging=false);
$("jockey").addEventListener("pointercancel",()=>dragging=false);

update(pos);
