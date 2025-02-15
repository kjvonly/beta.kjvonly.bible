import { bibleDB } from "$lib/db/bible.db"
import FlexSearch, { type Id } from 'flexsearch';

let index = new FlexSearch.Index();

async function init() {
    let indexes = index.search('for god so')
    if (indexes.length === 0) {
        await bibleDB.waitForIndexDB()

        let keys = await bibleDB.getAllKeys('chapters')
        keys.forEach(async (key: IDBValidKey) => {
            let chapter = await bibleDB.getValue('chapters', key.toString())
            if (key === 'booknames') {
                return
            }

            Object.keys(chapter['verseMap']).forEach((k) => {
                index.addAsync(`${key}_${k}`, `${chapter['verseMap'][k]}`)
            })
        });
    } else {
        postMessage(`already indexed ${indexes}`)
    }
}

async function search(id: string, text: string) {
    let indexes = await index.searchAsync(text, 100)
    let verses: any[] = []

    indexes = indexes.sort((a: Id, b: Id) => {
        let asplit = a.toString().split('_').map(i => {
            return parseInt(i)
        })

        let bsplit = b.toString().split('_').map(i => {
            return parseInt(i)
        })

        if (asplit[0] === bsplit[0]) {
            if (asplit[1] === bsplit[1]) {
                return asplit[2] - bsplit[2]
            } else {
                return asplit[1] - bsplit[1]
            }
        } else {
            return asplit[0] - bsplit[0]
        }

    })

    for (const i of indexes) {
        let chatperKeyIndex = i.toString().lastIndexOf('_');
        let chapterKey = i.toString().substring(0, chatperKeyIndex);
        let verseNumber = i.toString().substring(chatperKeyIndex + 1, i.toString().length);
        let chapter = await bibleDB.getValue('chapters', chapterKey);
        let verse = chapter['verseMap'][verseNumber];

        let data = { key: i.toString(), bookName: chapter['bookName'], number: chapter['number'], verseNumber: verseNumber, text: verse };

        verses.push(data);
    }

    if (verses.length > 0) {
        postMessage({ id: id, verses: verses })
    }
}

onmessage = async (e) => {
    switch (e.data.action) {
        case 'init':
            await init()
            break;
        case 'search':
            await search(e.data.id, e.data.text)
            break
    }
}

export { };