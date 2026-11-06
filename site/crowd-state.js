(function(root){
function applyMovement(players,event){const byWire=new Map(players.map(p=>[p.wireId,p]));for(const [id,x,y,moving,direction,pace=0]of event.positions||[]){const p=byWire.get(id);if(!p)continue;p.x=x;p.y=y;p.moving=!!moving;p.direction=direction;p.pace=pace}for(const [id,at,until,kind]of event.gestures||[]){const p=byWire.get(id);if(p)p.gesture={at,until,kind}}return players}
const api={applyMovement};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestCrowd=api;
})(typeof window!=='undefined'?window:globalThis);
