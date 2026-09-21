const $=s=>document.querySelector(s),R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,A=a=>a.reduce((x,y)=>x+y,0)/(a.length||1),P=id=>PLAYERS.find(x=>x.id===id);
let S={};const LIMITS={BAT:5,AR:2,WK:1,BOWL:3};
const countySelect=$("#county");
countySelect.innerHTML='<option value="" disabled selected>Select a county…</option>'+COUNTIES.map(c=>`<option value="${c}">${c}</option>`).join("");
function save(){localStorage.setItem("cdc-v11",JSON.stringify(S))}
$("#reset").onclick=()=>{localStorage.removeItem("cdc-v11");location.reload()};$("#again").onclick=()=>{localStorage.removeItem("cdc-v11");location.reload()};
$("#start").onclick=()=>{if(!$("#county").value){$("#county").focus();return}S={phase:"draft",team:$("#county").value,squad:[],picked:[],draftRound:0,draftCounty:null,round:0,results:[],form:{},stats:{},table:{},records:{highScore:null,bestBowl:null,highTeam:null,bigWin:null},selected:null};PLAYERS.forEach(x=>{S.form[x.id]=0;S.stats[x.id]={runs:0,wkts:0,matches:0}});COUNTIES.forEach(c=>S.table[c]={p:0,w:0,l:0,d:0,pts:0});nextCounty();$("#setup").classList.add("hide");$("#draft").classList.remove("hide");drawDraft();save()};
function counts(){let c={BAT:0,AR:0,WK:0,BOWL:0};S.squad.map(P).forEach(x=>c[x.role]++);return c}
function legal(x){return !S.picked.includes(x.id)&&counts()[x.role]<LIMITS[x.role]}
function nextCounty(){let cs=COUNTIES.filter(c=>PLAYERS.some(x=>x.county===c&&legal(x)));S.draftCounty=cs[R(0,cs.length-1)]}
function drawDraft(){let c=counts(),q=$("#search").value.toLowerCase(),role=$("#role").value;$("#draftRound").textContent=`Round ${S.draftRound+1} · Pick ${S.squad.length+1} of 11`;$("#revealCounty").textContent=S.draftCounty;$("#quota").innerHTML=`<div class=quota>${Object.entries(LIMITS).map(([r,n])=>`<span class="${c[r]===n?"done":""}">${r} ${c[r]}/${n}</span>`).join("")}</div>`;let arr=PLAYERS.filter(x=>x.county===S.draftCounty&&legal(x)&&(role==="ALL"||x.role===role)&&x.name.toLowerCase().includes(q));$("#players").innerHTML=arr.map(x=>`<div class=player-card><span class=tag>${x.role==="BOWL"?"Bowler":x.role==="WK"?"Wicketkeeper":x.role==="AR"?"All-rounder":"Batter"}</span><h3>${x.name}</h3><small>${x.county}</small><div class=stats><span class=stat>BAT ${x.bat}</span><span class=stat>BWL ${x.bowl}</span></div><p></p><button class=primary data-pick="${x.id}">Draft player</button></div>`).join("")||"<p>No legal choices with this filter.</p>";document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>pick(+b.dataset.pick));$("#draftXI").innerHTML=S.squad.map((id,i)=>{let x=P(id);return`<div class=row><span>${i+1}. <b>${x.name}</b></span><span class=tag>${x.role}</span></div>`}).join("")}
function pick(id){let x=P(id);if(!legal(x)||x.county!==S.draftCounty)return;S.squad.push(id);S.picked.push(id);S.draftRound++;if(S.squad.length===11)return startSeason();nextCounty();drawDraft();save()}
$("#search").oninput=drawDraft;$("#role").onchange=drawDraft;
function originalXI(t){let pool=PLAYERS.filter(x=>x.county===t),pick=(role,n,score)=>pool.filter(x=>x.role===role).sort((a,b)=>score(b)-score(a)).slice(0,n);return [...pick("BAT",5,x=>x.bat),...pick("AR",2,x=>(x.bat+x.bowl)/2),...pick("WK",1,x=>x.bat),...pick("BOWL",3,x=>x.bowl)]}
function XI(t){return t===S.team?S.squad.map(P):originalXI(t)}
function startSeason(){S.phase="season";S.schedule=COUNTIES.filter(c=>c!==S.team).sort(()=>Math.random()-.5).slice(0,14);S.venues=S.schedule.map((o,i)=>i%2?`${o} · Away`:`${S.team} · Home`);S.conditions=S.schedule.map(()=>makeConditions());$("#draft").classList.add("hide");$("#season").classList.remove("hide");drawSeason();save()}
function makeConditions(){let pitch=["Green seamer","Balanced surface","Dry turner","Flat batting pitch"][R(0,3)],weather=["Overcast","Bright","Breezy","Cloud building"][R(0,3)];return{pitch,weather}}
function mod(x,cond,inningsNo){let v=x.bat,fo=S.form[x.id]||0;v+=fo*2;if(cond.pitch==="Flat batting pitch")v+=5;return v}
function weighted(arr,fn){let w=arr.map(x=>Math.max(.1,fn(x))),z=w.reduce((a,b)=>a+b),r=Math.random()*z;for(let i=0;i<arr.length;i++){r-=w[i];if(r<=0)return arr[i]}return arr.at(-1)}
function partition(total,w){let z=w.reduce((a,b)=>a+b),v=w.map(x=>Math.max(0,Math.round(total*x/z))),d=total-v.reduce((a,b)=>a+b);while(d){let i=R(0,v.length-1);if(d>0){v[i]++;d--}else if(v[i]){v[i]--;d++}}return v}
function innings(team,opp,no,cond,target=null,ctx={}){
 let bats=XI(team),bows=XI(opp).filter(x=>x.role==="BOWL"||x.role==="AR"),ba=A(bats.map(x=>mod(x,cond,no))),bo=A(bows.map(x=>x.bowl+(S.form[x.id]||0)*2));
 let pitch=cond.pitch==="Green seamer"?-25:cond.pitch==="Dry turner"&&no===2?-22:cond.pitch==="Flat batting pitch"?35:0;
 let runs=Math.max(90,Math.round(300+(ba-bo)*2.15+pitch+R(-48,50))),rate=Math.max(2.35,Math.min(4.25,3.15+(ba-bo)/105+(cond.pitch==="Flat batting pitch"?.28:0)+R(-20,20)/100));
 let wickets=10,declared=false,endReason="ALL OUT",balls=Math.max(300,Math.round(runs/rate*6)),avail=Math.max(1,ctx.oversRemaining||384);
 if(target){
   let req=target/avail,chance=Math.max(.10,Math.min(.72,.46+(ba-bo)/120+(req<rate?.1:-Math.min(.22,(req-rate)*.08))-target/1800));
   if(Math.random()<chance&&target<=avail*Math.max(2.1,rate+.7)){runs=target+R(0,8);wickets=R(2,8);balls=Math.min(avail*6,Math.max(120,Math.round(runs/Math.max(rate,req+.15)*6)));endReason="TARGET REACHED"}
   else if(balls>avail*6){balls=avail*6;runs=Math.max(40,Math.min(target-1,Math.round(avail*rate+R(-25,25))));wickets=Math.max(2,Math.min(9,Math.round(avail/18+(bo-ba)/25+R(-1,1))));endReason="TIME EXPIRED"}
   else{runs=Math.min(target-1,runs);wickets=10;endReason="ALL OUT"}
 }else{
   let projected=balls/6,lead=ctx.lead||0,after=lead+runs,left=Math.max(0,avail-projected);
   let declare=(no===1&&runs>=405&&left>=150)||(no===2&&after>=260&&left>=55&&runs>=180);
   if(declare&&Math.random()<.48){wickets=R(5,8);declared=true;endReason="DECLARED";runs=Math.max(no===1?390:180,Math.round(runs*.92));balls=Math.max(240,Math.round(runs/(rate+.12)*6))}
   else if(projected>avail){balls=avail*6;runs=Math.max(35,Math.round(avail*rate+R(-20,20)));wickets=Math.max(1,Math.min(9,Math.round(avail/17+(bo-ba)/28+R(-1,1))));endReason="TIME EXPIRED"}
   else{wickets=10;endReason="ALL OUT"}
 }
 let weights=bats.map((x,i)=>Math.max(10,mod(x,cond,no)+R(-30,30)-(i>7?18:0))),rs=partition(runs,weights);
 let cards=bats.map((x,i)=>{let sr=Math.max(28,Math.min(80,48+(x.bat-60)*.35+R(-10,10))),bf=Math.max(1,Math.ceil(rs[i]/(sr/100))),f=Math.min(Math.floor(rs[i]/4),Math.round(rs[i]*.45/4));return{id:x.id,runs:rs[i],balls:bf,fours:f,out:false,dismissal:"not out"}});
 let pool=cards.slice(),dismissed=[];for(let k=0;k<Math.min(wickets,10);k++){let c=weighted(pool,z=>1/(z.runs+20));pool=pool.filter(z=>z!==c);dismissed.push(c)}
 let runouts=dismissed.length>2&&Math.random()<.18?1:0,credited=dismissed.length-runouts,bwk=Array(bows.length).fill(0);for(let k=0;k<credited;k++)bwk[bows.indexOf(weighted(bows,z=>z.bowl))]++;
 let rem=[...bwk];dismissed.forEach((c,idx)=>{c.out=true;if(idx<runouts)c.dismissal="run out";else{let choices=bows.map((b,i)=>({b,i})).filter(z=>rem[z.i]>0),pk=weighted(choices,z=>z.b.bowl);rem[pk.i]--;c.dismissal=Math.random()<.3?`b ${pk.b.name}`:Math.random()<.48?`lbw b ${pk.b.name}`:`c fielder b ${pk.b.name}`}});
 let totalBalls=Math.max(6,Math.min(avail*6,Math.round(balls/6)*6)),br=partition(runs,bows.map(x=>100-x.bowl+R(-8,8))),bb=partition(totalBalls,bows.map(x=>x.bowl));
 let bowling=bows.map((x,i)=>({id:x.id,balls:bb[i],runs:br[i],wkts:bwk[i]}));
 return{team,opp,runs,wkts:wickets,balls:totalBalls,declared,target,endReason,batting:Object.fromEntries(cards.map(x=>[x.id,x])),order:bats.map(x=>x.id),bowling:Object.fromEntries(bowling.map(x=>[x.id,x]))}
}
function totals(m,t){return m.innings.filter(i=>i.team===t).reduce((s,i)=>s+i.runs,0)}
function weatherOvers(c){let lost=c.weather==="Overcast"?R(0,18):c.weather==="Cloud building"?R(0,12):R(0,6);return Math.max(340,384-lost)}
function simulate(a,b,cond){
 let toss=Math.random()<.5?a:b,first=Math.random()<.78?toss:(toss===a?b:a),second=first===a?b:a,m={a,b,toss,batFirst:first,cond,innings:[],draw:false,winner:null,totalOvers:weatherOvers(cond),oversUsed:0,dayStates:{}};
 let remaining=()=>Math.max(0,m.totalOvers-m.oversUsed),push=i=>{m.innings.push(i);m.oversUsed+=i.balls/6};
 push(innings(first,second,1,cond,null,{oversRemaining:remaining(),lead:0}));if(!remaining()){m.draw=true;buildDays(m);scoreMatch(m);return m}
 push(innings(second,first,1,cond,null,{oversRemaining:remaining(),lead:-totals(m,first)}));if(!remaining()){m.draw=true;buildDays(m);scoreMatch(m);return m}
 let i3=innings(first,second,2,cond,null,{oversRemaining:remaining(),lead:totals(m,first)-totals(m,second)});push(i3);let target=totals(m,first)-totals(m,second)+1;
 if(i3.endReason==="TIME EXPIRED"||!remaining()){m.draw=true;buildDays(m);scoreMatch(m);return m}
 if(target<=0&&i3.endReason==="ALL OUT"){m.winner=second;m.inningsWin=true;m.inningsMargin=Math.max(1,totals(m,second)-totals(m,first));buildDays(m);scoreMatch(m);return m}
 let i4=innings(second,first,2,cond,target,{oversRemaining:remaining()});push(i4);if(i4.endReason==="TARGET REACHED")m.winner=second;else if(i4.endReason==="TIME EXPIRED"||i4.wkts<10)m.draw=true;else m.winner=first;buildDays(m);scoreMatch(m);return m
}
function buildDays(m){
 let per=m.totalOvers/4,bounds=[per,per*2,per*3,m.totalOvers],starts=[0,per,per*2,per*3],cursor=0;
 m.innings.forEach(i=>{let len=i.balls/6;i._from=cursor;i._to=cursor+len;cursor+=len});
 m.dayStates=[];
 bounds.forEach((end,d)=>{
   let start=starts[d],state=[];
   m.innings.forEach(i=>{
     if(i._to<=start||i._from>=end)return;
     let elapsed=Math.max(0,Math.min(end,i._to)-i._from),frac=Math.min(1,elapsed/(i.balls/6)),complete=i._to<=end;
     let runs=complete?i.runs:Math.round(i.runs*frac),wkts=complete?i.wkts:Math.min(i.wkts,Math.floor(i.wkts*frac));
     let suffix=complete?(i.endReason==="DECLARED"?"d":i.endReason==="ALL OUT"?" all out":""):"";
     state.push(`${i.team} ${runs}/${wkts}${suffix}`);
   });
   if(state.length)m.dayStates[d+1]=state.join(" · ");
 });
}

function result(m){
 if(m.draw)return"Match drawn";
 if(m.inningsWin){
   let margin=Math.max(1,m.inningsMargin||0);
   return`${m.winner} won by an innings and ${margin} run${margin===1?"":"s"}`;
 }
 let last=m.innings.at(-1);
 if(last&&last.team===m.winner&&last.endReason==="TARGET REACHED")
   return`${m.winner} won by ${10-last.wkts} wicket${10-last.wkts===1?"":"s"}`;
 if(last&&last.target&&last.team!==m.winner){
   let margin=Math.max(1,last.target-last.runs-1);
   return`${m.winner} won by ${margin} run${margin===1?"":"s"}`;
 }
 let loser=m.winner===m.a?m.b:m.a,margin=Math.max(1,totals(m,m.winner)-totals(m,loser));
 return`${m.winner} won by ${margin} run${margin===1?"":"s"}`;
}
function scoreMatch(m){m.potm=null;let best=-1;m.innings.forEach(i=>{Object.values(i.batting).forEach(c=>{S.stats[c.id].runs+=c.runs;if(c.runs>(S.records.highScore?.value||0))S.records.highScore={id:c.id,value:c.runs};let pts=c.runs;if(pts>best){best=pts;m.potm=c.id}});Object.values(i.bowling).forEach(b=>{S.stats[b.id].wkts+=b.wkts;if(b.wkts>(S.records.bestBowl?.value||0))S.records.bestBowl={id:b.id,value:b.wkts,runs:b.runs};let pts=b.wkts*24;if(pts>best){best=pts;m.potm=b.id}});if(i.runs>(S.records.highTeam?.value||0))S.records.highTeam={team:i.team,value:i.runs}});XI(m.a).concat(XI(m.b)).forEach(x=>S.stats[x.id].matches++);if(m.winner&&!m.inningsWin){let last=m.innings.at(-1),margin=last?.target&&last.team!==m.winner?Math.max(1,last.target-last.runs-1):Math.max(1,Math.abs(totals(m,m.winner)-totals(m,m.winner===m.a?m.b:m.a)));if(margin>(S.records.bigWin?.value||0))S.records.bigWin={team:m.winner,value:margin}}}
function apply(m){[m.a,m.b].forEach(t=>S.table[t].p++);if(m.draw){S.table[m.a].d++;S.table[m.b].d++;S.table[m.a].pts+=8;S.table[m.b].pts+=8}else{S.table[m.winner].w++;S.table[m.winner].pts+=16;S.table[m.winner===m.a?m.b:m.a].l++}}
function updateForm(m){XI(S.team).forEach(x=>{let perf=0;m.innings.filter(i=>i.team===S.team).forEach(i=>perf+=(i.batting[x.id]?.runs||0));m.innings.filter(i=>i.opp===S.team).forEach(i=>perf+=(i.bowling[x.id]?.wkts||0)*25);S.form[x.id]=perf>=100?2:perf>=55?1:perf<20?-1:0})}
function otherGames(opp){let r=COUNTIES.filter(c=>c!==S.team&&c!==opp).sort(()=>Math.random()-.5);for(let i=0;i<r.length;i+=2){let m=simulate(r[i],r[i+1],makeConditions());apply(m)}}
$("#season").onclick=e=>{let b=e.target.closest("[data-sim]");if(b)playMatch();let f=e.target.closest("[data-fixture]");if(f&&+f.dataset.fixture<S.results.length)openScore(+f.dataset.fixture);let s=e.target.closest("[data-order]");if(s)swapOrder(+s.dataset.order)};
function playMatch(){if(S.round>=14)return;let m=simulate(S.team,S.schedule[S.round],S.conditions[S.round]);apply(m);otherGames(S.schedule[S.round]);updateForm(m);S.results.push(m);S.round++;save();showReveal(m)}
function showReveal(m){$("#revealModal").classList.remove("hide");$("#continueResult").classList.add("hide");let finalDay=Math.min(4,Math.max(1,Math.ceil(m.oversUsed/(m.totalOvers/4)))),seq=[];for(let d=1;d<=finalDay;d++){let label=d===finalDay&&m.winner?`DAY ${d} · RESULT`:`DAY ${d} · CLOSE`;seq.push(`<div class=daycard>${label}<br><small>${m.dayStates[d]||m.dayStates[d-1]||"Play continues"}</small></div>`)}let k=0;$("#dayReveal").innerHTML="";$("#resultReveal").innerHTML="";let tick=()=>{if(k<seq.length){$("#dayReveal").innerHTML+=seq[k++];setTimeout(tick,420)}else{$("#resultReveal").innerHTML=`<div class=finalresult>${result(m)}</div><div class=potm>⭐ Player of the Match<br><b>${P(m.potm)?.name||"—"}</b></div>`;$("#continueResult").classList.remove("hide")}};tick()}
$("#continueResult").onclick=()=>{$("#revealModal").classList.add("hide");drawSeason()};$("#viewSummary").onclick=()=>{if(S.round>=14)showAwards()};
function swapOrder(i){if(S.selected===null){S.selected=i}else{[S.squad[S.selected],S.squad[i]]=[S.squad[i],S.squad[S.selected]];S.selected=null;save()}drawSeason()}
function overs(b){return`${Math.floor(b/6)}.${b%6}`}
function openScore(n){let m=S.results[n],nums={};$("#modalTitle").textContent=`${m.a} v ${m.b}`;$("#scorecard").innerHTML=`<div class=result-banner>${result(m)}</div><div class=potm>⭐ Player of the Match: <b>${P(m.potm)?.name}</b></div><p>${m.toss} won the toss · ${m.cond.pitch} · ${m.cond.weather}</p>`+m.innings.map(i=>{nums[i.team]=(nums[i.team]||0)+1;let ba=i.order.map(id=>i.batting[id]).map(c=>`<div class=score-row><b>${P(c.id).name}</b><span class=dismissal>${c.dismissal}</span><b>${c.runs}</b><span>${c.balls}</span><span class=fours>${c.fours}</span><span class=sr>${(c.runs/c.balls*100).toFixed(1)}</span></div>`).join(""),bo=Object.values(i.bowling).map(b=>`<div class=bowling-row><b>${P(b.id).name}</b><span>${overs(b.balls)}</span><span>${b.runs}</span><b>${b.wkts}</b><span>${(b.runs/(b.balls/6)).toFixed(2)}</span></div>`).join("");return`<div class=innings-card><div class=innings-title><span>${i.team} · innings ${nums[i.team]} · ${i.endReason||""}</span><span>${i.runs}/${i.wkts}${i.declared?" dec":""}</span></div><div class="score-row head"><span>Batter</span><span class=dismissal>Dismissal</span><span>R</span><span>B</span><span class=fours>4s</span><span class=sr>SR</span></div>${ba}<div class=section-label>BOWLING</div>${bo}</div>`}).join("");$("#scoreModal").classList.remove("hide")}
$("#closeModal").onclick=()=>$("#scoreModal").classList.add("hide");$("#scoreModal").onclick=e=>{if(e.target.id==="scoreModal")$("#scoreModal").classList.add("hide")};
function standings(){return Object.entries(S.table).sort((a,b)=>b[1].pts-a[1].pts||b[1].w-a[1].w)}
function drawSeason(){let st=standings(),pos=st.findIndex(x=>x[0]===S.team)+1;$("#seasonTitle").textContent=`${S.team} Draft XI · Match ${Math.min(S.round+1,14)} of 14`;$("#position").textContent=pos;$("#points").textContent=S.table[S.team].pts;$("#formStrip").innerHTML=S.results.slice(-5).map(m=>`<span class="${m.draw?"D":m.winner===S.team?"W":"L"}">${m.draw?"D":m.winner===S.team?"W":"L"}</span>`).join(" ");$("#calendar").innerHTML=S.schedule.map((o,i)=>{let m=S.results[i],r=m?(m.draw?"D":m.winner===S.team?"W":"L"):"";return`<div class="fixture ${i===S.round?"current":""} ${m?"done":""}" data-fixture="${i}"><small>M${i+1}</small><b>${o}</b>${m?`<span class="res ${r}">${r}</span><small>View scorecard</small>`:`<span class=condition>${S.venues[i]}</span>`}</div>`}).join("");if(S.round<14){let c=S.conditions[S.round],o=S.schedule[S.round];$("#preMatch").innerHTML=`<div><span class=kicker>NEXT FIXTURE</span><div class=bigfixture>${S.team} vs ${o}</div><span class=condition>${S.venues[S.round]}</span></div><div><b>${c.pitch}</b><br><span class=condition>Pitch</span></div><div><b>${c.weather}</b><br><span class=condition>Weather</span></div><button class=primary data-sim>Play Match</button>`}else $("#preMatch").innerHTML=`<div><span class=kicker>CHAMPIONSHIP COMPLETE</span><div class=bigfixture>All 14 matches played</div><span class=condition>Review any fixture above to reopen its scorecard.</span></div>`;$("#seasonCompleteActions").classList.toggle("hide",S.round<14);$("#squad").innerHTML=S.squad.map((id,i)=>{let x=P(id),f=S.form[id]||0;return`<div class="row selectrow ${S.selected===i?"selected":""}" data-order="${i}"><span>${i+1}. <b>${x.name}</b></span><span><span class=tag>${x.role}</span> <span class="form ${f>0?"up":f<0?"down":""}">${f>0?"↑":f<0?"↓":"→"}</span></span></div>`}).join("");$("#table").innerHTML=`<div class="trow head"><span>#</span><span>County</span><span>P</span><span>W</span><span>D</span><span>Pts</span></div>`+st.map(([t,x],i)=>`<div class="trow ${t===S.team?"me":""}"><span>${i+1}</span><b>${t}</b><span>${x.p}</span><span>${x.w}</span><span>${x.d}</span><b>${x.pts}</b></div>`).join("");let ss=Object.entries(S.stats).map(([id,x])=>({id:+id,...x}));$("#bat").innerHTML=ss.sort((a,b)=>b.runs-a.runs).slice(0,6).map(x=>`<div class=row><span>${P(x.id).name}</span><b>${x.runs}</b></div>`).join("");$("#bowl").innerHTML=ss.sort((a,b)=>b.wkts-a.wkts).slice(0,6).map(x=>`<div class=row><span>${P(x.id).name}</span><b>${x.wkts}</b></div>`).join("");let r=S.records;$("#records").innerHTML=`<div class=record>Highest score <b>${r.highScore?`${P(r.highScore.id).name} ${r.highScore.value}`:"—"}</b></div><div class=record>Best bowling <b>${r.bestBowl?`${P(r.bestBowl.id).name} ${r.bestBowl.value}/${r.bestBowl.runs}`:"—"}</b></div><div class=record>Highest total <b>${r.highTeam?`${r.highTeam.team} ${r.highTeam.value}`:"—"}</b></div><div class=record>Biggest run margin <b>${r.bigWin?`${r.bigWin.team} ${r.bigWin.value}`:"—"}</b></div>`}
function showAwards(){S.phase="awards";$("#season").classList.add("hide");$("#awards").classList.remove("hide");let st=standings(),pos=st.findIndex(x=>x[0]===S.team)+1,own=S.squad.map(id=>({id,...S.stats[id]})),run=own.sort((a,b)=>b.runs-a.runs)[0],wk=[...own].sort((a,b)=>b.wkts-a.wkts)[0],draft=[...own].sort((a,b)=>(b.runs+b.wkts*25)-(a.runs+a.wkts*25))[0];$("#awardTitle").textContent=`${S.team} finish ${pos}${pos===1?"st":pos===2?"nd":pos===3?"rd":"th"}`;$("#awardGrid").innerHTML=`<div class=award>Top run-scorer<b>${P(run.id).name}</b>${run.runs} runs</div><div class=award>Top wicket-taker<b>${P(wk.id).name}</b>${wk.wkts} wickets</div><div class=award>Draft Pick of the Season<b>${P(draft.id).name}</b>${draft.runs} runs · ${draft.wkts} wickets</div><div class=award>Highest innings<b>${S.records.highScore?P(S.records.highScore.id).name:"—"}</b>${S.records.highScore?.value||0}</div><div class=award>Best bowling<b>${S.records.bestBowl?P(S.records.bestBowl.id).name:"—"}</b>${S.records.bestBowl?`${S.records.bestBowl.value}/${S.records.bestBowl.runs}`:"—"}</div><div class=award>Season record<b>${S.table[S.team].w}W ${S.table[S.team].d}D ${S.table[S.team].l}L</b>${S.table[S.team].pts} points</div>`;save()}
let old=localStorage.getItem("cdc-v11");if(old){S=JSON.parse(old);$("#setup").classList.add("hide");if(S.phase==="draft"){$("#draft").classList.remove("hide");drawDraft()}else if(S.phase==="awards")showAwards();else{$("#season").classList.remove("hide");drawSeason()}}