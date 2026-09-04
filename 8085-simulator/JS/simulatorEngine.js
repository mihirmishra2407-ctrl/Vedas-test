const $=id=>document.getElementById(id), initial=$('code').value;
let r={A:0,B:0,C:0,D:0,E:0,H:0,L:0},flags={S:0,Z:0,AC:0,P:1,CY:0},pc=0,sp=0xFFFF,steps=0,tstates=0,halted=false,breaks=new Set,mem={};

const hx=(n,w=2)=>(n&((w===4)?65535:255)).toString(16).toUpperCase().padStart(w,'0')+'H';
const parity=n=>(n.toString(2).match(/1/g)||[]).length%2?0:1;

function parse(){
	let labels={},addr=0,rows=[];
	for(const [idx,raw] of $('code').value.split(/\n/).entries()){
		let s=raw.split(';')[0].trim(); if(!s)continue;
		let lm=s.match(/^(\w+):\s*(.*)$/);
		if(lm){labels[lm[1].toUpperCase()]=addr; s=lm[2]; if(!s)continue}
		let p=s.replace(/,/g,' ').trim().split(/\s+/),m=p.shift().toUpperCase();
		let bytes=['NOP','HLT','ADD','SUB','INR','DCR','ANA','ORA','XRA','CMA','RLC','RRC','RAL','RAR','RET','PUSH','POP','XCHG','SPHL','XTHL'].includes(m)?1:['MVI','ADI','ACI','SUI','SBI','ANI','ORI','XRI','CPI','IN','OUT'].includes(m)?2:3;
		rows.push({line:idx+1,m,op:p,addr,bytes});
		addr+=bytes;
	}
	return {rows,labels};
}

function val(x,p){
	x=(x||'').toUpperCase(); if(p.labels[x]!=null)return p.labels[x];
	if(x.endsWith('H'))return parseInt(x.slice(0,-1),16);
	if(x.endsWith('B'))return parseInt(x.slice(0,-1),2);
	return Number(x)||0;
}

function setFlags(n,carry=0){
	n&=255; flags={...flags,S:n>>7,Z:n===0?1:0,P:parity(n),CY:carry?1:0,AC:0};
}

function writeMem(addr, val) { mem[addr & 65535] = val & 255; }
function readMem(addr) { return mem[addr & 65535] || 0; }

function execute(i,p){
	let o=i.op,a=o[0]?o[0].toUpperCase():'',b=o[1]?o[1].toUpperCase():'',next=i.addr+i.bytes;
	pc=next;
	if(i.m==='HLT'){halted=true; return}
	if(i.m==='MVI'){if(a==='M')writeMem((r.H<<8|r.L),val(b,p)); else r[a]=val(b,p); return}
	if(i.m==='MOV'){let v=a==='M'?readMem(r.H<<8|r.L):r[b]||0; if(a==='M')writeMem((r.H<<8|r.L),v); else r[a]=v; return}
	if(i.m==='LXI'){
		let v=val(b,p);
		if(a==='SP')sp=v;
		else if(a==='H'){r.H=v>>8;r.L=v&255}
		else if(a==='B'){r.B=v>>8;r.C=v&255}
		else if(a==='D'){r.D=v>>8;r.E=v&255}
		return;
	}
	if(i.m==='ADD'||i.m==='SUB'){let v=a==='M'?readMem(r.H<<8|r.L):r[a]||0,n=i.m==='ADD'?r.A+v:r.A-v; r.A=n&255; setFlags(n,n<0||n>255?1:0); return}
	if(i.m==='INR'||i.m==='DCR'){let v=a==='M'?readMem(r.H<<8|r.L):r[a]||0; v=i.m==='INR'?v+1:v-1; if(a==='M')writeMem((r.H<<8|r.L),v&255); else r[a]=v&255; setFlags(v,flags.CY); return}
	if(i.m==='STA'){writeMem(val(a,p),r.A); return}
	if(i.m==='LDA'){r.A=readMem(val(a,p)); return}
	if(i.m==='XCHG'){let th=r.H,tl=r.L; r.H=r.D; r.L=r.E; r.D=th; r.E=tl; return}
	if(i.m==='SPHL'){sp=(r.H<<8)|r.L; return}
	
	// STACK MECHANICS
	if(i.m==='PUSH'){
		let hi=0, lo=0;
		if(a==='B'){hi=r.B; lo=r.C}
		else if(a==='D'){hi=r.D; lo=r.E}
		else if(a==='H'){hi=r.H; lo=r.L}
		else if(a==='PSW'){hi=r.A; lo=(flags.S<<7)|(flags.Z<<6)|(flags.AC<<4)|(flags.P<<2)|(1<<1)|flags.CY}
		writeMem(sp-1, hi); writeMem(sp-2, lo); sp-=2; return;
	}
	if(i.m==='POP'){
		let lo=readMem(sp), hi=readMem(sp+1); sp+=2;
		if(a==='B'){r.B=hi; r.C=lo}
		else if(a==='D'){r.D=hi; r.E=lo}
		else if(a==='H'){r.H=hi; r.L=lo}
		else if(a==='PSW'){
			r.A=hi; flags.S=lo>>7&1; flags.Z=lo>>6&1; flags.AC=lo>>4&1; flags.P=lo>>2&1; flags.CY=lo&1;
		}
		return;
	}
	if(i.m==='XTHL'){
		let lo=readMem(sp), hi=readMem(sp+1);
		writeMem(sp, r.L); writeMem(sp+1, r.H);
		r.H=hi; r.L=lo; return;
	}
	
	// SUBROUTINES & BRANCHING
	if(i.m==='CALL'){writeMem(sp-1, next>>8); writeMem(sp-2, next&255); sp-=2; pc=val(a,p); return}
	if(i.m==='RET'){pc=readMem(sp)|(readMem(sp+1)<<8); sp+=2; return}
	if(i.m==='JNZ'||i.m==='JZ'||i.m==='JC'||i.m==='JNC'||i.m==='JMP'){
		let take=i.m==='JMP'||(i.m==='JNZ'&&!flags.Z)||(i.m==='JZ'&&flags.Z)||(i.m==='JC'&&flags.CY)||(i.m==='JNC'&&!flags.CY);
		if(take)pc=val(a,p); return;
	}
}

function render(){
	let p=parse();
	
	// 1. Update line counts and synchronize breakpoints
	$('lineCount').textContent=$('code').value.split(/\n/).length;
	$('numbers').innerHTML=$('code').value.split(/\n/).map((_,i)=>`<div class="${i+1===((p.rows.find(x=>x.addr===pc)||{}).line)?'current ':''}${breaks.has(i+1)?'break':''}" data-line="${i+1}">${breaks.has(i+1)?'● ':''}${i+1}</div>`).join('');
	$('numbers').onclick=e=>{if(e.target.dataset.line){breaks.has(+e.target.dataset.line)?breaks.delete(+e.target.dataset.line):breaks.add(+e.target.dataset.line); render()}};
	
	// 2. Render CPU Registers (including Live Stack Pointer and Program Counter)
	$('regs').innerHTML=Object.entries({...r,SP:sp,PC:pc}).map(([k,v])=>`<div class="reg"><b>${k}</b><strong>${hx(v,k==='PC'||k==='SP'?4:2)}</strong></div>`).join('');
	
	// 3. Render Status Flags
	$('flags').innerHTML=Object.entries(flags).map(([k,v])=>`<div class="flag ${v?'on':''}"><b>${v}</b>${k}</div>`).join('');
	
	// 4. Update Dynamic Memory Viewer
	let addrs=[0x2050,0x2000,0x2001,0x2002,0x2003,0x2004];
	if(sp < 0xFFFF && !addrs.includes(sp)) { addrs.unshift(sp+1); addrs.unshift(sp); }
	$('memory').innerHTML=[...new Set(addrs)].slice(0,7).map(a=>`<div class="memory-row"><span class="addr">${hx(a,4)}</span><span>${hx(readMem(a))}</span><span class="note">${a===0x2050?'result':(a>=sp&&sp<0xFFFF)?'stack':'memory'}</span></div>`).join('');
	
	// 5. BULLETPROOF CALL STACK RENDERING (Fixes the endless stack-piling glitch)
	let stackHTML=``;
	let currSp = sp;
	let safetyCounter = 0;
	
	// Only render elements if the Stack Pointer has explicitly moved down from 0xFFFF
	if (currSp >= 0x0000 && currSp < 0xFFFF) {
		// Stop looping instantly if it hits 0xFFFF or passes 16 total rows (prevents runaway UI)
		while (currSp < 0xFFFF && safetyCounter < 16) {
			let lo = readMem(currSp), hi = readMem(currSp+1);
			stackHTML += `<div class="stack"><span>STACK AT ${hx(currSp,4)}</span><span>${hx((hi<<8)|lo,4)}</span></div>`;
			currSp += 2;
			safetyCounter++;
		}
	}
	
	// Fallback baseline display if the stack is resting at its default position
	if(!stackHTML) {
		stackHTML = `<div class="stack"><span>MAIN BASE</span><span>FFFFH</span></div>`;
	}
	
	// Robust DOM targeting: Scans for the literal header name instead of hardcoded panel positions
	let panels = document.querySelectorAll('.panel');
	panels.forEach(panel => {
		let heading = panel.querySelector('h3');
		if(heading && heading.textContent.toUpperCase().includes('CALL STACK')) {
			panel.innerHTML = `<h3>Call stack</h3>` + stackHTML;
		}
	});
	
	// 6. Update Performance Metrics and Operational Status
	$('metrics').innerHTML=`${tstates} T-states &nbsp; · &nbsp; ${steps} instructions`;
	$('status').textContent=halted?'■ HALTED':`○ ${steps?'PAUSED':'READY'} · ${steps?'inspect state':'select an instruction'}`;
}

function step(){
	let p=parse(),i=p.rows.find(x=>x.addr===pc);
	if(!i){halted=true; render(); return}
	execute(i,p); steps++; tstates+=i.bytes===1?4:i.bytes===2?7:10;
	if(breaks.has((p.rows.find(x=>x.addr===pc)||{}).line)) { halted=true; }
	render();
}

// BUG FIXED: Now purges memory storage dictionary objects completely upon reload to clear zombie bytes
function reset(){
	r={A:0,B:0,C:0,D:0,E:0,H:0,L:0}; flags={S:0,Z:0,AC:0,P:1,CY:0}; pc=0; sp=0xFFFF; steps=0; tstates=0; halted=false; mem={}; $('error').textContent=''; render();
}

$('code').oninput=()=>{reset()}; $('step').onclick=step; $('reset').onclick=reset;
$('stop').onclick=()=>{halted=true; $('status').textContent='■ STOPPED'}; $('pause').onclick=()=>{};
$('run').onclick=()=>{let n=0; try{while(!halted&&n++<10000)step(); if(n>=10000)throw Error('Infinite loop safety protection activated.')}catch(e){$('error').textContent=e.message}};
$('save').onclick=()=>{localStorage.setItem('vedas8085',$('code').value); alert('Program saved on this PC.')};
$('open').onclick=()=>{$('code').value=localStorage.getItem('vedas8085')||initial; reset()};
$('examples').onclick=()=>openModal('Example programs',`<p>Choose a starter program.</p><button class="btn example" data-code="${initial.replace(/"/g,'&quot;')}">Add two numbers</button><button class="btn example" data-code="LXI SP, 2700H\nMVI B, AAH\nMVI C, 55H\nPUSH B\nMVI B, 00H\nMVI C, 00H\nPOP B\nHLT">Stack Operation Test</button><button class="btn example" data-code="LXI SP, 2800H\nCALL SUBR\nHLT\nSUBR:\nMVI A, FFH\nRET">Subroutine CALL/RET Test</button>`);
$('help').onclick=()=>openModal('8085 workstation notes','<p>Fully functional stack runtime activated. Code supports LXI SP, PUSH, POP, CALL, RET, XTHL, and SPHL commands.</p>');

function openModal(t,b){
	$('modalTitle').textContent=t; $('modalBody').innerHTML=b; $('modal').classList.add('open');
	document.querySelectorAll('.example').forEach(x=>x.onclick=()=>{$('code').value=x.dataset.code; reset(); $('modal').classList.remove('open')})
}
if(!$('modal')) {
	document.body.insertAdjacentHTML('beforeend', '<div id="modal" class="modal"><div class="dialog"><h2 id="modalTitle"></h2><div id="modalBody"></div><button id="close" class="btn" style="margin-top:12px;">Close</button></div></div>');
}
$('close').onclick=()=>$('modal').classList.remove('open');
render();