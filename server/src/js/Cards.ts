class Card {
    private cardValue: number;
    _id?: number;
    constructor(cardValue: number) {
        this.cardValue = cardValue;
    }

    setValue(newValue: number) {
        this.cardValue = newValue;
    }

    getValue() {
        return this.cardValue;
    }
}
class Cards {
    public cards: Card[];
    constructor() {
        this.cards = [];
    }
    public addCard(card: Card): void {
        this.cards.push(card);
    }
    public isNext(): boolean {
        return this.cards.length != 0;
    }
    getCardAt(i: number): Card | undefined {
        return this.cards[i];
    }
    getLength(): number {
        return this.cards.length;
    }
    getCards(): Card[] {
        return this.cards;
    }
}
export { Card, Cards };
