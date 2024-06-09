// Constants 
INDENT = 20;

function addClick(el) {
    var bullet = el.parentElement
    var jsBullet = new BulletList(JSON.parse(sessionStorage.getItem(bullet.id)))
    var newBullet = jsBullet.addSubBullet("test")
    sessionStorage.setItem(newBullet.id,JSON.stringify(newBullet))
    sessionStorage.setItem(jsBullet.id,JSON.stringify(jsBullet))
}

function toggleClick(el) {
    console.log("toggleClick called")
    var bullet = el.parentElement
    var jsBullet = new BulletList(JSON.parse(sessionStorage.getItem(bullet.id)))
    jsBullet.toggleComplete()
}

class BulletList {
    constructor(id,name=null,depth=0){
        if (typeof id != "string") {
            this.altConstructor(id)
        } else {
            this.name = name
            this.done = false
            this.numChildren = 0
            this.depth = depth
            this.id = id;
            this.htmlString=`<p class="bullet" id="${this.id}"><input type="checkbox" onclick="toggleClick(this)"> <label for="${this.id}"> ${this.name} </label><input type="button" onclick="addClick(this)">+</input></p>`;
        }
    }

    altConstructor(bleh){
        this.name = bleh.name;
        this.done = bleh.done;
        this.numChildren = bleh.numChildren
        this.depth=bleh.depth;
        this.id = bleh.id;
        this.htmlString=`<p class="bullet" id="${this.id}"><input type="checkbox" onclick="toggleClick(this)"> <label for="${this.id}"> ${this.name} </label><input type="button" onclick="addClick(this)">+</input></p>`;
    }

    addSubBullet(name=null) {
        var newId = this.id+"."+(this.numChildren).toString();
        this.numChildren+=1;
        var newBullet = new BulletList(newId,name,this.depth+1);
        this.getDOMElement().insertAdjacentHTML("afterend",newBullet.htmlString);
        var newBulletDOM=document.getElementById(newId);
        newBulletDOM.style.margin = `0px 0px 0px ${INDENT*this.depth}px`;
        sessionStorage.setItem(newBullet.id,newBullet);
        return newBullet
    }
    
    toggleComplete(userClicked=false) {
        console.log("toggleComplete called")
        this.done = !this.done;
        sessionStorage.setItem(this.id,JSON.stringify(this))
        if (!userClicked){
            this.getDOMElement().firstElementChild.checked = this.done;
        }
        if (this.depth){
            var parentId = this.getParentId();
            var parentObj = new BulletList(JSON.parse(sessionStorage.getItem(parentId)));
            parentObj.checkComplete();
        }
    }
    
    checkComplete(){
        console.log("checkComplete called");
        var children = [];
        var i=0;
        while (i<this.numChildren){
            var childId = this.id+"."+i.toString();
            children.push(new BulletList(JSON.parse(sessionStorage.getItem(childId))));
            i+=1;
        }
        console.log(children)
        var result = true;
        console.log(result)
        for (let i=0; i<children.length; i++) {
            let child=children[i]
            console.log(child.done)
            if (!child.done){
                result=false;
            }
        }
        console.log(result)
        if (result != this.done){
            this.toggleComplete();
        }
        console.log(result);
    }

    getDOMElement() {
        return document.getElementById(this.id);
    }

    getParentId(){
        var i = this.id.length - 1;
        while (this.id[i] != ".") {
            i-=1;
        }
        return this.id.substring(0,i)
    }
}

function makeBaseNode() {
    var baseBullet = new BulletList("base","base");
    document.body.insertAdjacentHTML("beforeend",baseBullet.htmlString);
    sessionStorage.setItem("base",JSON.stringify(baseBullet));
}
