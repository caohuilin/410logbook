import Koa from 'koa';
import util from 'util';
import fs from "fs"
import koaRouter from 'koa-router'
import request from 'co-request';
import _ from 'lodash';

const router = koaRouter();
const app = new Koa();

router
    .get('/member', getMember)
    .get('/note',getNote)
    .get('/note/:userId',getIndexNote);

app
    .use(router.routes())
    .use(router.allowedMethods());


const readFileSy = (file)=>new Promise((resolve, reject)=> {
    fs.readFile(file, 'utf8', (err, data)=> {
        if (err) {
            return reject(err);
        }
        return resolve(data);
    });
});

const readdirSy = (path) => new Promise((resolve, reject)=> {
    fs.readdir(path, (err, data)=> {
        if (err) {
            return reject(err);
        }
        return resolve(data);
    });
});

async function getMember(ctx) {
    const con = await readFileSy("./hua/person");
    const con_line = con.split('\n');
    const member = [];

    for(let i = 0;i < con_line.length - 1;i++){
        const person = {};
        person.id = i;
        person.name = con_line[i].substring(0,2);
        person.desc = con_line[i].substring(3,con_line[i].length - 1);
        member.push(person);
    }
    ctx.body = member;
}

async function getNote(ctx){
    const noteList = await readdirSy("./hua/note");
    let k = 0;
    const noteConList = noteList.map(async (note)=> {
        const con = await readFileSy("./hua/note/" + note);
        const con_line = con.split('\n');
        const noteItem = {};
        noteItem.id = k++;
        noteItem.userId = parseInt(con_line[0].substring(3,con_line[0].length - 1));
        noteItem.date = con_line[1].substring(3,con_line[1].length - 1);
        noteItem.mood = con_line[2].substring(3,con_line[2].length - 1);
        noteItem.content = con_line[3].substring(3,con_line[3].length - 1);
        return noteItem;
    });
    ctx.body = await Promise.all(noteConList);
}

async function getIndexNote(ctx){
    const noteList = await readdirSy("./hua/note");
    const userId = parseInt(ctx.params.userId);
    let k = 0;
    const noteConList = noteList.map(async (note)=> {
        const con = await readFileSy("./hua/note/" + note);
        const con_line = con.split('\n');
        const user = parseInt(con_line[0].substring(3,con_line[0].length - 1));
        if(user === userId){
            const noteItem = {};
            noteItem.id = k++;
            noteItem.userId = user;
            noteItem.date = con_line[1].substring(3,con_line[1].length - 1);
            noteItem.mood = con_line[2].substring(3,con_line[2].length - 1);
            noteItem.content = con_line[3].substring(3,con_line[3].length - 1);
            return noteItem;
        }else{
            return null;
        }
    });
    const r =  await Promise.all(noteConList);
    ctx.body = r.filter(v=>v);
}

app.listen(3000, () => console.log('server started 3000'));

export default app;

