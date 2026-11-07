(function(root){
'use strict';
const ids=['authoring','engagement','accessibility','insight','adoption','scale','assessment','feedback','ai_confidence','staff_time','course_refresh','reporting_capacity','learner_support','optimization'];
const segments={
 he:[
  'Course content takes too long to build','Students aren’t engaging with course content','We need to make course materials more accessible','It’s hard to show student learning impact',
  'Faculty need more support using Brightspace','We need to reach more students and programs','Course assessment takes too much effort','Students need more timely feedback',
  'Faculty need confidence using AI','Our learning technology team has limited capacity','Existing university courses need a refresh','We need help turning student learning data into reports',
  'Students need more support between classes','We want to optimize our university’s Brightspace environment'
 ],
 k12:[
  'Lesson materials take too long to create','Students aren’t engaging with lessons','We need to support different learning and accessibility needs','It’s hard to understand student progress',
  'Teachers need more support using Brightspace','We need consistent learning across schools and classrooms','Classroom assessment takes too much effort','Students and families need more timely feedback',
  'Teachers need confidence using AI responsibly','Our school technology team has limited capacity','Existing lessons need a refresh','We need help turning classroom data into useful reports',
  'Students need more practice and support at home','We want to optimize Brightspace for our schools'
 ],
 corp:[
  'Employee training content takes too long to build','Employees aren’t engaging with training','We need more accessible workforce training','It’s hard to show the business impact of training',
  'Our learning team needs more platform support','We need to scale training across teams and locations','Skills and compliance assessments take too much effort','Employees need more timely feedback on their skills',
  'Our team needs confidence using AI for training','Our training administrators have limited capacity','Existing onboarding and training need a refresh','We need help turning training data into business reports',
  'Employees need more support applying new skills','We want to optimize our workforce learning environment'
 ],
 public:[
  'Public-service learning content takes too long to build','Staff and community learners aren’t engaging','We need more accessible public-service learning','It’s hard to show the impact of our learning programs',
  'Our learning team needs more platform support','We need to reach more staff, partners and communities','Required training assessments take too much effort','Participants need more timely feedback',
  'Our team needs confidence using AI responsibly','Our program administrators have limited capacity','Existing public-service programs need a refresh','We need help turning program data into useful reports',
  'Staff and community learners need more support','We want to optimize Brightspace for our programs'
 ],
 hq:[
  'Demo and enablement content takes too long to build','Our internal learning needs to be more engaging','We want to improve accessibility in our demos','We need clearer evidence of enablement impact',
  'Our team needs more product and platform support','We need to scale enablement across D2L teams','Checking product knowledge takes too much effort','Our teams need more timely learning feedback',
  'We want more confidence demonstrating responsible AI','Our enablement team has limited admin capacity','Existing demo and training content needs a refresh','We need help turning enablement data into insights',
  'Our colleagues need more practice and support','We want to optimize our internal Brightspace experience'
 ]
};
function forSegment(segment){return (segments[segment]||segments.he).map((name,i)=>({id:ids[i],name}))}
const api={forSegment};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestChallenges=api;
})(typeof window!=='undefined'?window:globalThis);
