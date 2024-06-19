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
    newBullet.innerHTML = `<input type="checkbox" onclick="toggleClick(this)"> <textarea spellcheck="false" wrap="hard" cols="48" >${bulletData.fieldText}</textarea><button type="button" onclick="editClick(this)">Lock</button><button type="button" onclick="addClick(this)">+</button><button type="button" onclick="deleteClick(this)">-</button>`
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

function deleteBullet(id) {
    let N = id.length;
    let checklist = [...bulletKeys]
    let i=0
    for (key of checklist) {
        console.log(key);
        if (key.slice(0,N)==id) {
            console.log("Deleting");
            bulletKeys.splice(i,1);
            i-=1;
            delete bulletDict[key];
        } else {
            console.log("not deleting");
        }
        i++;
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
if (localStorage['bulletKeys']) {
    var bulletKeys = JSON.parse(localStorage['bulletKeys']);
} else {
    var bulletKeys = [];
}

function onLoad() {
    let checklist = [...bulletKeys];
    if (!checklist || checklist.length==0) {
        addBullet("base");
    } else {
        for (let id of checklist) {
            addBullet(id,JSON.parse(localStorage[id]));
        }
    }
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
        editButton.innerHTML = "Lock";
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

function deleteClick(el) {
    bulletId = el.parentElement.id;
    el.parentElement.remove();
    deleteBullet(bulletId);
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
    let bullet = '\u2022';
    let check = '\u2714';
    if (checkbox.checked) {
        newStuff += " ".repeat(indent)+check+textField.value+"\n";
    } else {
        newStuff += " ".repeat(indent)+bullet+textField.value+"\n";
    }
    for (let i=5; i<bulletHTML.children.length; i++) {
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

function quickSave() {
    bulletKeys.sort()
    localStorage.setItem("bulletKeys",JSON.stringify(bulletKeys));
    console.log(bulletKeys);
    console.log(bulletDict);
    for (id of bulletKeys) {
        currBullet = bulletDict[id];
        currBullet.fieldText = document.getElementById(id).children[1].value;
        localStorage.setItem(id,JSON.stringify(bulletDict[id]));
    }
}

function clearTestPlan() {
    localStorage.clear();
    location.reload(false);
}