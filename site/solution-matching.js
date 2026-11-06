(function(root){
const solutions=[
{id:'creator',icon:'✦',name:'Creator+',sub:'Interactive content & course authoring',url:'https://www.d2l.com/brightspace/creator/'},
{id:'access',icon:'◉',name:'Accessibility+',sub:'Accessible content & inclusive learning',url:'https://www.d2l.com/brightspace/accessibility-plus/'},
{id:'lumi',icon:'✧',name:'D2L Lumi',sub:'AI-supported teaching & learning',url:'https://www.d2l.com/lumi/'},
{id:'services',icon:'⌁',name:'Learning Services',sub:'Course design, training & learning strategy',url:'https://www.d2l.com/services-and-support/'},
{id:'performance',icon:'↗',name:'Performance+',sub:'Learning analytics & engagement insights',url:'https://www.d2l.com/brightspace/performance/'},
{id:'achievement',icon:'◎',name:'Achievement+',sub:'Learning outcomes & achievement reporting',url:'https://www.d2l.com/brightspace/achievement/'},
{id:'link',icon:'⌘',name:'D2L Link',sub:'Brightspace integrations & connected workflows',url:'https://www.d2l.com/brightspace/integrations/'}];
solutions.push({id:'optimization',icon:'◎',name:'Optimization Services',sub:'Expert platform, administration & analytics support',url:'https://www.d2l.com/services-and-support/optimize/'});
const demoUrls={creator:'https://d2l.navattic.com/fz2f03jt',access:'https://d2l.navattic.com/lyj033d',performance:'https://d2l.navattic.com/5u1004jo',lumi:'https://d2l.navattic.com/wcu0mde'};for(const solution of solutions)if(demoUrls[solution.id])solution.demoUrl=demoUrls[solution.id];
const championsSignupUrl='https://d2l.customershome.com/user-request/';
function match(s){const points=Object.fromEntries(solutions.map(p=>[p.id,0])),reasons={};const add=(id,n,why)=>{points[id]+=n;(reasons[id]??=[]).push(why)};const goals=new Set(s.successMetrics?.length?s.successMetrics:s.successMetric?[s.successMetric]:[]),pain=new Set(s.painPoints||[]),uses=new Set(s.useCases||[]),topics=new Set(s.contentTopics||[]),challenge=s.challengeText||'';
const missionMap={interactive:'creator',accessibility:'access',analytics:'performance',ai:'lumi',outcomes:'achievement',optimization:'optimization','course-design':'services','team-confidence':'services',integrations:'link',engagement:'creator'},missionIds=s.missionIds?.length?s.missionIds:s.missionId?[s.missionId]:[],selectedProducts=new Set(missionIds.map(id=>missionMap[id]).filter(Boolean)),missionProduct=missionMap[missionIds[0]];for(const id of selectedProducts)add(id,30,'This power-up supports a mission you chose.');
if(pain.has('authoring')){add('lumi',6,'You want to reduce manual content creation.');add('creator',3,'You want a more efficient course-authoring workflow.')}
if(pain.has('engagement'))add('creator',6,'You want more engaging learning content.');
if(pain.has('accessibility'))add('access',7,'You identified accessibility as a barrier.');
if(pain.has('insight')){add('performance',6,'You want clearer evidence of learning engagement and impact.');if(uses.has('outcomes'))add('achievement',7,'Your use case includes assessment and learning outcomes.')}
if(pain.has('adoption'))add('services',6,'You want support with adoption, training or learning design.');
if(pain.has('scale')){add('services',4,'You want help planning and scaling your learning approach.');add('link',1,'You may want to explore how connected workflows support scale.')}
if(pain.has('optimization')||pain.has('staff_time')||pain.has('reporting_capacity'))add('optimization',10,'You want expert help with Brightspace operations, configuration or analytics.');if(uses.has('optimize'))add('optimization',6,'Your use case includes optimizing your Brightspace environment.');if(pain.has('assessment')){add('creator',3,'You want a more efficient assessment workflow.');add('services',2,'You may benefit from learning-design support.')}if(pain.has('feedback')||pain.has('learner_support')||pain.has('ai_confidence'))add('lumi',3,'You want to explore AI-supported learning or feedback workflows.');if(pain.has('course_refresh')){add('creator',3,'You want to modernize your course content.');add('services',4,'You want support refreshing your learning design.')}
if(pain.has('integrations'))add('link',7,'You want Brightspace to connect more effectively with other systems.');
if(/accessib/i.test(challenge))add('access',4,'Your mission focuses on more accessible learning.');
if(/AI|time|content development/i.test(challenge))add('lumi',3,'Your mission includes AI or content efficiency.');
if(/engage|interactive|content/i.test(challenge))add('creator',2,'Your mission focuses on learner engagement or interactive content.');
if(/impact|report|analytics/i.test(challenge))add('performance',3,'Your mission calls for better learning insight.');
if(/ecosystem|systems|integration/i.test(challenge))add('link',3,'Your mission involves a connected learning ecosystem.');
if(goals.has('inclusion'))add('access',2,'Your desired result is more inclusive learning.');
if(goals.has('impact')){add('performance',2,'You want to demonstrate learning impact.');if(uses.has('outcomes'))add('achievement',4,'You want to track achievement against learning outcomes.')}
if(goals.has('confidence'))add('services',3,'You want your educators or team to feel more confident.');
if(uses.has('outcomes'))add('achievement',2,'You selected outcomes-based learning as a use case.');
for(const [topic,id]of [['ai','lumi'],['content','creator'],['accessibility','access'],['adoption','services'],['outcomes','achievement'],['strategy','services']])if(topics.has(topic))add(id,1,'This aligns with a topic you want to explore.');
if(!Object.values(points).some(Boolean))add(s.role==='admin'||s.role==='leader'||s.role==='training'?'services':'creator',1,'A starting point for a conversation about your learning mission.');
const owned=new Set(s.existingProducts||[]);return solutions.filter(p=>(!owned.has(p.id)||selectedProducts.has(p.id))&&points[p.id]>0).map(p=>({...p,alreadyUsing:owned.has(p.id),score:points[p.id],reason:owned.has(p.id)&&p.id===missionProduct?'Your chosen mission builds on a tool you already use. Explore how to get more from it.':reasons[p.id][0],reasons:[...new Set(reasons[p.id])]})).sort((a,b)=>b.score-a.score);
}
function recommend(s){const list=match(s);return list[0]||{...solutions.find(p=>p.id==='services'),reason:'You already use the options matched to this mission. Explore support for getting more from your existing tools.',allAlreadyUsing:true}}
function followUp(s){const matches=match(s),selected=new Set(s.products||[]);return solutions.filter(p=>selected.has(p.id)).map(p=>({id:p.id,name:p.name,resourceUrl:p.url,interestType:'selected_by_customer',reason:matches.find(m=>m.id===p.id)?.reason||'You selected this product or service to explore.',formats:s.channels||[],storyTypes:s.storyTypes||[],topics:s.contentTopics||[]}))}
function missionMatches(s){const all=match(s),map={interactive:'creator',accessibility:'access',analytics:'performance',ai:'lumi',outcomes:'achievement',optimization:'optimization','course-design':'services','team-confidence':'services',integrations:'link',engagement:'creator'},ids=s.missionIds?.length?s.missionIds:s.missionId?[s.missionId]:[];if(!ids.length)return all.slice(0,3);const products=[...new Set(ids.map(id=>map[id]).filter(Boolean))],selected=products.map(id=>all.find(p=>p.id===id)).filter(Boolean),support=all.find(p=>p.id==='optimization'&&!products.includes(p.id));return support?[...selected,support]:selected}
const api={missionMatches,solutions,championsSignupUrl,match,recommend,followUp};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestSolutions=api;
})(typeof window!=='undefined'?window:globalThis);
