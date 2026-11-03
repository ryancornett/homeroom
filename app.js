'use strict';
const config = window.HOMEROOM || {};
function validUrl(value,host){try{const u=new URL(value);return u.protocol==='https:'&&(!host||u.hostname===host);}catch{return false;}}
if(validUrl(config.essentialEducationUrl)){const link=document.querySelector('#essential-link');link.href=config.essentialEducationUrl;link.textContent='Open Essential Education ↗';}
if(Array.isArray(config.youtubePlaylists)&&config.youtubePlaylists.length){const container=document.querySelector('#playlists');container.replaceChildren();config.youtubePlaylists.filter(p=>validUrl(p.url)).forEach(p=>{const a=document.createElement('a');a.href=p.url;a.textContent=p.title+' — Video ↗';const line=document.createElement('p');line.append(a);container.append(line);});}
const form=document.querySelector('#contact-form'),status=document.querySelector('#form-status'),send=document.querySelector('#send');
const connected=validUrl(config.formspreeEndpoint,'formspree.io');
if(connected){form.action=config.formspreeEndpoint;send.disabled=false;send.innerHTML='Send message <span>↗</span>';document.querySelector('#form-notice').textContent='Please do not include passwords or sensitive records.';}
form.addEventListener('submit',async event=>{event.preventDefault();if(!connected){status.textContent='This draft is not connected. Please contact us by email or phone.';return;}if(!form.email.value.trim()&&!form.phone.value.trim()){status.textContent='Please provide an email address or phone number so we can reply.';form.email.focus();return;}send.disabled=true;status.textContent='Sending your message…';try{const response=await fetch(config.formspreeEndpoint,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Send failed');status.textContent='Your message was sent. Thank you for getting in touch.';form.reset();}catch{status.textContent='Your message could not be sent. Your text is still here. Please try again or use email or phone.';}finally{send.disabled=false;}});

// Guided orientation uses a native modal dialog to contain keyboard focus.
// The real page stays visible behind it; the tour never opens links or submits forms.
const tourSteps = [
 {target:'#routine-title',title:'Start here each day',text:'Make the homeroom your starting place. Check your instructor’s directions in email, texts, or your learning platform. Return here to open your work.'},
 {target:'#ixl-card',title:'Open your assigned platform',text:'If your instructor assigned IXL, use this card to sign in and practice those skills. Your platform records the work you complete.'},
 {target:'#essential-card',title:'Using Essential Education?',text:validUrl(config.essentialEducationUrl)?'Use this card to open Essential Education and continue the lessons your instructor assigned.':'This card is for Essential Education. Its program sign-in link is still being added to this draft. Ask Ryan for your link if you need it.'},
 {target:'#individual-work h3',title:'Send other assignments by email',text:'For work outside your learning platform, email your file or clear photos to ryan@laureladulted.org. Include your name and the assignment title. Ask Ryan what to do next if you finish or get stuck.'},
 {target:'#hyflex-schedule',title:'Go straight to the weekly schedule',text:'This button takes you to the HyFlexKY weekly schedule. Find your class time and follow its joining instructions. You can return to the homeroom afterward.'},
 {target:'#center-hours-title',title:'Plan your visit',text:'The learning center’s hours are listed here in Eastern time. On Tuesdays and Thursdays, the center is closed from 12:30 to 4:00 PM. Use the booking calendar to choose an appointment. Check the center hours here when planning your visit.'},
 {target:'#sign-in-help',title:'Get help with digital tasks',text:'Open a help question to see short steps for signing in, joining class, finding files, or emailing work. You can read just the steps you need.'},
 {target:'#contact-ryan',title:'You can always ask Ryan',text:'Email ryan@laureladulted.org for help. Ryan responds within 24 hours on weekdays; weekend messages are answered the next weekday. Bookmark the homeroom and use “Start the tour” anytime you want to review.'}
];
const tour=document.querySelector('#orientation');
const tourPanel=tour.querySelector('.tour-panel');
const tourHighlight=document.querySelector('#tour-highlight');
const tourLine=document.querySelector('#tour-line');
const tourTitle=document.querySelector('#tour-title');
const tourDescription=document.querySelector('#tour-description');
const tourNext=document.querySelector('#tour-next');
const tourBack=document.querySelector('#tour-back');
let tourIndex=0,tourLauncher=null,tourScroll=0,tourFrame=0;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function positionTour(){
 if(!tour.open)return;
 const target=document.querySelector(tourSteps[tourIndex].target);
 const rect=target.getBoundingClientRect(),panel=tourPanel.getBoundingClientRect();
 const left=Math.max(6,rect.left-7),top=Math.max(6,rect.top-7);
 const right=Math.min(innerWidth-6,rect.right+7),bottom=Math.min(panel.top-18,rect.bottom+7);
 Object.assign(tourHighlight.style,{left:left+'px',top:top+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});
 const visible=bottom>top&&right>left;
 tourHighlight.style.visibility=visible?'visible':'hidden';
 tourLine.style.visibility=visible?'visible':'hidden';
 tourLine.setAttribute('x1',String(panel.left+panel.width/2));tourLine.setAttribute('y1',String(panel.top-3));
 tourLine.setAttribute('x2',String((left+right)/2));tourLine.setAttribute('y2',String(bottom+5));
}
function showTourStep(){
 cancelAnimationFrame(tourFrame);
 const step=tourSteps[tourIndex],target=document.querySelector(step.target);
 tourTitle.textContent=step.title;tourDescription.textContent=step.text;
 document.querySelector('#tour-progress').textContent=`Step ${tourIndex+1} of ${tourSteps.length}`;
 tourBack.disabled=tourIndex===0;tourNext.textContent=tourIndex===tourSteps.length-1?'Finish tour ✓':'Next →';
 // Focus the new title without letting the browser move the page unexpectedly.
 tourTitle.focus({preventScroll:true});
 window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-36),behavior:reducedMotion.matches?'instant':'smooth'});
 // Follow the target during native smooth scrolling; a new step cancels the old loop.
 const until=performance.now()+1000;
 function follow(){positionTour();if(tour.open&&performance.now()<until)tourFrame=requestAnimationFrame(follow);}
 follow();
}
function startTour(event){
 if(tour.open)return;
 tourLauncher=event.currentTarget;tourScroll=window.scrollY;tourIndex=0;
 document.documentElement.classList.add('tour-active');tour.showModal();showTourStep();
}
function endTour(){if(tour.open)tour.close();}
document.querySelectorAll('[data-start-tour]').forEach(button=>button.addEventListener('click',startTour));
document.querySelector('#tour-end').addEventListener('click',endTour);
tourNext.addEventListener('click',()=>{if(tourIndex===tourSteps.length-1){endTour();return;}tourIndex++;showTourStep();});
tourBack.addEventListener('click',()=>{if(tourIndex>0){tourIndex--;showTourStep();}});
tour.addEventListener('cancel',event=>{event.preventDefault();endTour();});
tour.addEventListener('close',()=>{cancelAnimationFrame(tourFrame);document.documentElement.classList.remove('tour-active');window.scrollTo({top:tourScroll,behavior:'instant'});tourLauncher?.focus({preventScroll:true});});
window.addEventListener('resize',()=>{if(tour.open){showTourStep();}});
window.addEventListener('scroll',positionTour,{passive:true});

const todayDate=document.querySelector('#today-date');if(todayDate){const now=new Date();todayDate.textContent=`${now.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}.`;}