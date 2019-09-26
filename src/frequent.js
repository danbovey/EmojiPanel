

class Frequent {
    getAll() {
        var list = localStorage.getItem('EmojiPanel-frequent') || '[]';

        try {
            return JSON.parse(list);
        } catch (e) {
            return [];
        }
    }
    add(emoji) {
        var list = this.getAll();

        if (list.find(row => row.char == emoji.char)) {
            return false;
        }

        list.push(emoji);
        localStorage.setItem('EmojiPanel-frequent', JSON.stringify(list));
        return true;
    }
}

export default new Frequent();