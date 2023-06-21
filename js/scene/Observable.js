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

    notifyObservers(...args) {
        this._observers.forEach(observer => {
            observer(...args);
        });
    }
}

export {Observable}