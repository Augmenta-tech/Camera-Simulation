class Observable {
    constructor() {
        this._observers = [];
    }

    addObserver(observer) {
        this._observers.push(observer);

        return () => {
            this._observers = this._observers.filter(o => o !== observer);
        };
    }

    notifyAllObservers(...args) {
        this._observers.forEach(observer => {
            observer(...args);
        });
    }

    notifyObserversExceptOrigin(origin, ...args) {
        this._observers.filter(o => o !== origin).forEach(observer => {
            observer(...args);
        });
    }
}

export {Observable}