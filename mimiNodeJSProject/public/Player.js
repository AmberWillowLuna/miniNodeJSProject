

class Player {
    _score;
    _nickname;
    _color;
    _pos;

    constructor(nickname, color, pos) {
        this._nickname = nickname;
        this._color = color;
        this._pos = pos;
    }

    serialize() {
        return {
            nickname: this._nickname,
            color: this._color,
            pos: this._pos
        };
    }

    setPos(pos) {
        this._pos = pos;
    }

    MoveX(delta) {
        this._pos[0] += delta;
    }

    MoveY(delta) {
        this._pos[1] += delta;
    }

    get_nickname() {
        return this._nickname;
    }

    get_color() {
        return this._color;
    }

    getX() {
        return this._pos[0];
    }

    getY() {
        return this._pos[1];
    }

    getPos() {
                return this._pos;
    }

}

window.Player = Player