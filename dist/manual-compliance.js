(()=>{
"use strict";
const KEY="eosdo-lite-review-v2", $=s=>document.querySelector(s), esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}}, put=s=>{localStorage.setItem(KEY,JSON.stringify(s));window.dispatchEvent(new Event("eosdo-manual-change"))};
const audit=(s,a,o)=>{s.audit=s.audit||[];s.audit.unshift({at:new Date().toLocaleString("ru-RU"),action:a,object:o});put(s)};
const types=["Служебная записка","Распоряжение","Доверенность","Заключение о выдаче лицензии","Лицензия","Заявка на судебно-претензионный документ","Претензия","Судебное дело","Исполнительный документ","Сделка бухгалтерского архива","Документ РИД"];
function installTypes(){let x=$("#type");if(!x)return;types.forEach(t=>{if(![...x.options].some(o=>o.value===t))x.add(new Option(t,t))})}
const fields={
"Служебная записка":[["recipient","Адресат"],["department","Подразделение"],["docText","Текст служебной записки"]],
"Распоряжение":[["approver","Утверждающий"],["controller","Контролёр"],["docText","Текст распоряжения"]],
"Договор":[["counterparty","Контрагент"],["contractNo","Номер договора"],["contractDate","Дата договора"],["curator","Куратор"]],
"Входящий документ":[["sender","Отправитель"],["incomingNo","Номер отправителя"],["incomingDate","Дата документа"]],
"Исходящий документ":[["recipient","Получатель"],["signer","Подписант"],["docText","Текст документа"]],
"Заявка на доверенность":[["lawyer","Юрист"],["proxyFor","На кого оформляется"],["validUntil","Срок действия"]],
"Доверенность":[["proxyFor","Доверенное лицо"],["validUntil","Срок действия"],["basis","Основание"]],
"Вопрос":[["meetingOrg","Организация заседания"],["docText","Содержание вопроса"]],
"Повестка дня":[["meetingDate","Дата заседания"],["meetingOrg","Организация заседания"]],
"Протокол":[["meetingDate","Дата заседания"],["signer","Подписант"]],
"Решение":[["meetingOrg","Организация заседания"],["signer","Подписант"]],
"Лист исполнения":[["supportCenter","Центр поддержки"],["docText","Содержание"]],
"Заключение о выдаче лицензии":[["licenseType","Вид лицензии"],["signer","Подписант"]],
"Лицензия":[["licenseType","Вид лицензии"],["validUntil","Срок действия"]],
"Заявка на судебно-претензионный документ":[["lawyer","Юрист"],["basis","Основание"]],
"Претензия":[["counterparty","Контрагент"],["claimAmount","Сумма требований"]],
"Судебное дело":[["court","Суд"],["caseNo","Номер дела"],["lawyer","Ответственный юрист"]],
"Исполнительный документ":[["caseNo","Номер судебного дела"],["basis","Основание"]],
"Сделка бухгалтерского архива":[["basis","Документ-основание"],["operationType","Тип хозяйственной операции"],["curator","Куратор"]],
"Документ РИД":[["ridType","Вид РИД"],["author","Автор/правообладатель"],["patentNo","Номер заявки/патента"]]
};
function renderFields(){let el=$("#typeFields"),t=$("#type")?.value;if(!el)return;el.innerHTML=(fields[t]||[]).map(([n,l])=>`<label>${esc(l)}<input name="x_${n}"></label>`).join("")}
function calendar(){let el=$("#calendarWorkspace");if(!el)return;let d=new Date(),y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),cells="";for(let i=0;i<first.getDay();i++)cells+="<span></span>";for(let n=1;n<=days;n++){let w=new Date(y,m,n).getDay();cells+=`<button class="cal-day ${w===0||w===6?"weekend":""}" data-cal-day="${n}">${n}</button>`}el.innerHTML=`<div class="cal-head"><b>${first.toLocaleString("ru-RU",{month:"long",year:"numeric"})}</b><span>Нажмите день, чтобы отметить рабочий/нерабочий</span></div><div class="cal-grid"><b>Вс</b><b>Пн</b><b>Вт</b><b>Ср</b><b>Чт</b><b>Пт</b><b>Сб</b>${cells}</div>`}
}
function assistants(){let el=$("#assistantList");if(!el)return;let s=get();s.assistants=s.assistants||[];el.innerHTML=s.assistants.map((x,i)=>`<div class="row"><div><strong>${esc(x.person)}</strong><span>${esc(x.mode)} · ${esc(x.from)} — ${esc(x.to)}</span></div><button data-assistant-delete="${i}">Удалить</button></div>`).join("")||"<p>Помощники не назначены.</p>"}
function barcode(){let n="EOSDO-"+Date.now().toString().slice(-10);alert("Штрихкод документа: "+n)}
document.addEventListener("DOMContentLoaded",()=>{installTypes();renderFields();calendar();assistants()});
document.addEventListener("change",e=>{if(e.target.id==="type")renderFields()});
document.addEventListener("submit",e=>{if(e.target.id!=="createForm")return;let fd=new FormData(e.target),extra={};for(const [k,v] of fd)if(k.startsWith("x_"))extra[k.slice(2)]=v;setTimeout(()=>{let s=get(),d=s.docs?.[0];if(d){d.requisites={...(d.requisites||{}),...extra};if(d.type==="Служебная записка"&&/^ДОК-/.test(d.number))d.number=d.number.replace(/^ДОК-/,"СЗ-");if(d.type==="Распоряжение"&&/^ДОК-/.test(d.number))d.number=d.number.replace(/^ДОК-/,"РП-");put(s)}},30)},true);
document.addEventListener("click",e=>{
 if(e.target.closest("#barcodeBtn"))return barcode();
 if(e.target.closest("#helpBtn"))return alert("ЕОСДО: создайте документ, заполните реквизиты, сформируйте маршрут согласования/подписания, затем зарегистрируйте документ.");
 if(e.target.closest("#supportBtn"))return alert("Техподдержка: сформируйте обращение с описанием ошибки и приложите снимок экрана.");
 if(e.target.closest("#logoutBtn"))return alert("Демо-версия: серверная авторизация не подключена.");
 if(e.target.closest("[data-add-assistant]")){let s=get();s.assistants=s.assistants||[];let p=prompt("Помощник");if(!p)return;let mode=prompt("Режим: параллельный или последовательный","параллельный")||"параллельный";s.assistants.push({person:p,mode,from:new Date().toLocaleDateString("ru-RU"),to:"бессрочно"});audit(s,"Назначен помощник",p);assistants();return}
 let ad=e.target.closest("[data-assistant-delete]");if(ad){let s=get();s.assistants=s.assistants||[];let x=s.assistants.splice(+ad.dataset.assistantDelete,1)[0];audit(s,"Удалён помощник",x?.person||"");assistants();return}
 if(e.target.closest("[data-add-substitution]")){document.querySelector("#substitute")?.click();return}
 if(e.target.closest("[data-archive-inventory]")||e.target.closest("[data-archive-transfer-act]")||e.target.closest("[data-archive-destroy-act]")){let s=get();s.archiveActs=s.archiveActs||[];let kind=e.target.closest("[data-archive-inventory]")?"Опись дел":e.target.closest("[data-archive-transfer-act]")?"Акт передачи":"Акт на уничтожение";s.archiveActs.unshift({kind,at:new Date().toLocaleDateString("ru-RU"),status:"Сформирован"});audit(s,"Сформирован архивный документ",kind);alert(kind+" сформирован");return}
 if(e.target.closest("[data-medo-incoming]")){let s=get();s.medo=s.medo||[];let sender=prompt("Отправитель входящего пакета МЭДО","Организация");if(!sender)return;s.medo.unshift({id:"m"+Date.now(),direction:"incoming",number:"МЭДО-"+Date.now().toString().slice(-6),sender,status:"Получен",history:["Получен входящий пакет"]});audit(s,"Получен пакет МЭДО",sender);location.reload();return}
});
window.addEventListener("eosdo-manual-change",()=>assistants());
})();