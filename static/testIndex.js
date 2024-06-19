//---------------------------General Setup------------------------//

class Bullet {
    constructor(fieldText="",done=false,readOnly=false,numChildren=0) {
        this.fieldText = fieldText;
        this.done = false; 
        this.readOnly = false;
        this.numChildren = 0;
    }
}

function makeHTMLBullet(id,bulletData) {
    let newBullet = document.createElement("div");
    newBullet.classList.add("bullet");
    newBullet.id = id;
    newBullet.innerHTML = `<input type="checkbox" onclick="toggleClick(this)"> <textarea spellcheck="false" wrap="hard" cols="48" value=${bulletData.name}"></textarea><button type="button" onclick="editClick(this)">Save</button><button type="button" onclick="addClick(this)">+</button>`
    if (bulletData.done) {
        newBullet.children[0].checked = true;
    }
    if (bulletData.readOnly){
        newBullet.children[1].readOnly = true;
    }
    return newBullet
}

//-------------------- Helper Functions ------------------------//

function addBullet(id,proto=null) {
    let newBullet;
    let newHTMLBullet;
    if (proto) {
        newBullet = new Bullet(proto.fieldText,proto.done,proto.readOnly);
        bulletKeys.push(id);
        bulletDict[id]=newBullet;
        newHTMLBullet=makeHTMLBullet(id,newBullet)
        document.body.appendChild(newHTMLBullet);
    } else {
        newBullet = new Bullet();
        bulletKeys.push(id);
        bulletDict[id]=newBullet;
        let parentId = getParentId(id);
        newHTMLBullet=makeHTMLBullet(id,newBullet)
        if (parentId) {
            let parentBullet = bulletDict[parentId];
            let parentBulletHTML = document.getElementById(parentId);
            parentBullet.numChildren += 1;
            parentBulletHTML.appendChild(newHTMLBullet);
            newHTMLBullet.style.marginLeft = INDENT;
        } else {
            document.body.appendChild(newHTMLBullet);
        }
    }
}

function getParentId(id) {
    let heritage = id.split(".");
    if (heritage.length == 1) {
        return null;
    } else {
        return id.slice(0,-1-heritage.at(-1).length)
    }
}

function markChildrenComplete(id) {
    let bullet = bulletDict[id];
    for (let i=0; i<bullet.numChildren; i++) {
        let childId = id + "." + i.toString();
        document.getElementById(childId).firstChild.checked = true;
        markChildrenComplete(childId);
    }
}

function checkComplete(id){
    let bullet = bulletDict[id];
    let bulletHTML = document.getElementById(id);
    let result = true;
    for (let i=0; i<bullet.numChildren; i++) {
        let subBulletCheckBox=document.getElementById(id+"."+i.toString()).firstChild;
        if (!subBulletCheckBox.checked){
            result=false;
        }
    }
    if (result != bulletHTML.firstChild.checked){
        bulletHTML.firstChild.checked=result;
        let parentId = getParentId(id);
        if (parentId) {
            checkComplete(getParentId(id));
        }
    }
}

//-------------------- Event Handlers ------------------//
var nonBulletKeys = ['INDENT','length','bgColor','secondaryColor','textColor','bulletKeys'];
var bulletDict = {};

var INDENT = "20px";
var bgColor = localStorage['bgColor'];
var secondaryColor = localStorage['secondaryColor'];
var textColor = localStorage['textColor'];
var bulletKeys = localStorage['bulletKeys'] || [];

if (!bulletKeys || bulletKeys.length==0) {
    addBullet("base");
}

function onLoad() {
    console.log("onLoad called");
}

function editClick(el) {
    let bulletHTML = el.parentElement;
    let textField = bulletHTML.children[1];
    let editButton = bulletHTML.children[2];
    if (!textField.hasAttribute('readonly')) {
        textField.setAttribute('readonly', 'readonly');
        editButton.innerHTML = "Edit";
    } else {
        textField.removeAttribute('readonly');
        editButton.innerHTML = "Save";
    }
}

function addClick(el) {
    bulletId = el.parentElement.id;
    let bullet = bulletDict[bulletId]
    let newId = bulletId + "." + bullet.numChildren.toString();
    addBullet(newId);
}

function toggleClick(el) {
    let bulletHTML = el.parentElement;
    if (el.checked) {
        markChildrenComplete(bulletHTML.id);
    }
    let parentBulletId = getParentId(bulletHTML.id);
    if (parentBulletId) {
        checkComplete(parentBulletId);
    } else {
        console.log(`No parent element found for element with id ${bulletHTML.id}`)
    }
}

function appendBulletToClipboard(bulletHTML) {
    newStuff = "";
    let checkbox = bulletHTML.children[0];
    let textField = bulletHTML.children[1];
    let editButton = bulletHTML.children[2];
    if (!textField.hasAttribute('readonly')) {
        textField.setAttribute('readonly', 'readonly');
        editButton.innerHTML = "Edit";
    }
    let indent = 5*(bulletHTML.id.match(/\./g)||[]).length;
    console.log(bulletHTML.id);
    console.log(bulletHTML.id.match(/\./g));
    let bullet = '\u2022';
    let check = '\u2714';
    if (checkbox.checked) {
        newStuff += " ".repeat(indent)+check+textField.value+"\n";
    } else {
        newStuff += " ".repeat(indent)+bullet+textField.value+"\n";
    }
    for (let i=4; i<bulletHTML.children.length; i++) {
        let subBullet = bulletHTML.children[i];
        newStuff += appendBulletToClipboard(subBullet);
    }
    return newStuff
}


function copyTestPlan() {
    let bodyEl = document.body;
    let result = "";
    for (let i=2; i<bodyEl.children.length; i++) {
        let child=bodyEl.children[i];
        result += appendBulletToClipboard(child);
    }
    navigator.clipboard.writeText(result);
}
/* TODO: 
- "Copy Test Plan" (should copy to clipboard and format nicely)
- "Quick-Save Test Plan" function (will store in localStorage (for now))
*/