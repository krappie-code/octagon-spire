// Octagon Spire - MMA Card Fighter
// Game state and logic

class Game {
    constructor() {
        this.player = {
            health: 100,
            maxHealth: 100,
            energy: 3,
            maxEnergy: 3,
            deck: [],
            hand: [],
            effects: []
        };
        
        this.opponent = null;
        this.currentFight = 1;
        this.maxFights = 5;
        this.selectedCards = [];
        this.gamePhase = 'combat'; // 'combat', 'victory', 'defeat'
        
        this.initializeDeck();
        this.initializeOpponents();
        this.startFight();
        this.setupEventListeners();
    }
    
    initializeDeck() {
        // Starting deck - basic MMA moves
        const startingCards = [
            { name: "Jab", type: "standup", cost: 1, damage: 6, description: "Quick straight punch" },
            { name: "Jab", type: "standup", cost: 1, damage: 6, description: "Quick straight punch" },
            { name: "Hook", type: "standup", cost: 2, damage: 10, description: "Powerful curved punch" },
            { name: "Low Kick", type: "standup", cost: 2, damage: 8, description: "Targets opponent's legs" },
            { name: "Double Leg", type: "takedown", cost: 2, damage: 7, description: "Takedown attempt" },
            { name: "Guard", type: "neither", cost: 1, damage: 0, description: "Block 5 damage this turn", effect: "block_5" },
            { name: "Rest", type: "neither", cost: 0, damage: 0, description: "Gain 1 energy", effect: "gain_energy_1" },
            { name: "Sprawl", type: "takedown", cost: 1, damage: 4, description: "Counter takedown attempt" }
        ];
        
        this.player.deck = [...startingCards];
        this.shuffleDeck();
    }
    
    initializeOpponents() {
        this.opponents = [
            {
                name: "Amateur Fighter",
                type: "Balanced",
                health: 60,
                maxHealth: 60,
                style: "balanced",
                moves: [
                    { name: "Wild Swing", damage: 8, type: "standup" },
                    { name: "Basic Grapple", damage: 6, type: "takedown" }
                ]
            },
            {
                name: "Street Brawler",
                type: "Striker",
                health: 70,
                maxHealth: 70,
                style: "striker",
                moves: [
                    { name: "Heavy Haymaker", damage: 12, type: "standup" },
                    { name: "Knee Strike", damage: 10, type: "standup" },
                    { name: "Clumsy Tackle", damage: 4, type: "takedown" }
                ]
            },
            {
                name: "College Wrestler",
                type: "Grappler",
                health: 80,
                maxHealth: 80,
                style: "grappler",
                moves: [
                    { name: "Single Leg", damage: 9, type: "takedown" },
                    { name: "Body Slam", damage: 11, type: "takedown" },
                    { name: "Weak Jab", damage: 5, type: "standup" }
                ]
            },
            {
                name: "Veteran Fighter",
                type: "Technical",
                health: 90,
                maxHealth: 90,
                style: "technical",
                moves: [
                    { name: "Perfect Counter", damage: 8, type: "both" },
                    { name: "Submission Hold", damage: 10, type: "takedown" },
                    { name: "Precise Strike", damage: 9, type: "standup" }
                ]
            },
            {
                name: "The Champion",
                type: "Elite",
                health: 120,
                maxHealth: 120,
                style: "champion",
                moves: [
                    { name: "Championship Combo", damage: 15, type: "standup" },
                    { name: "Elite Takedown", damage: 13, type: "takedown" },
                    { name: "Perfect Defense", damage: 0, type: "both", effect: "block_all" },
                    { name: "Champion's Fury", damage: 18, type: "both" }
                ]
            }
        ];
    }
    
    startFight() {
        this.opponent = { ...this.opponents[this.currentFight - 1] };
        this.player.energy = this.player.maxEnergy;
        this.selectedCards = [];
        
        this.drawHand();
        this.updateUI();
        this.logMessage(`Fight ${this.currentFight}: Face off against ${this.opponent.name}!`);
    }
    
    shuffleDeck() {
        for (let i = this.player.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.player.deck[i], this.player.deck[j]] = [this.player.deck[j], this.player.deck[i]];
        }
    }
    
    drawHand() {
        this.player.hand = [];
        const handSize = 5;
        
        for (let i = 0; i < handSize && this.player.deck.length > 0; i++) {
            this.player.hand.push(this.player.deck.shift());
        }
        
        // If deck is empty, shuffle discard pile back in (simplified)
        if (this.player.deck.length === 0) {
            this.shuffleDeck();
        }
    }
    
    setupEventListeners() {
        document.getElementById('end-turn-btn').addEventListener('click', () => {
            this.endTurn();
        });
        
        document.getElementById('view-deck-btn').addEventListener('click', () => {
            this.showDeck();
        });
        
        document.getElementById('confirm-cards-btn').addEventListener('click', () => {
            this.confirmCardSelection();
        });
    }
    
    updateUI() {
        // Update player stats
        document.getElementById('player-health-text').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('player-health-bar').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('player-energy-text').textContent = `${this.player.energy}/${this.player.maxEnergy}`;
        document.getElementById('player-energy-bar').style.width = `${(this.player.energy / this.player.maxEnergy) * 100}%`;
        
        // Update opponent stats
        document.getElementById('opponent-name').textContent = this.opponent.name;
        document.getElementById('opponent-type-text').textContent = this.opponent.type;
        document.getElementById('fight-round').textContent = `Fight ${this.currentFight} of ${this.maxFights}`;
        document.getElementById('opponent-health-text').textContent = `${this.opponent.health}/${this.opponent.maxHealth}`;
        document.getElementById('opponent-health-bar').style.width = `${(this.opponent.health / this.opponent.maxHealth) * 100}%`;
        
        // Update hand
        this.renderHand();
    }
    
    renderHand() {
        const handContainer = document.getElementById('hand');
        handContainer.innerHTML = '';
        
        this.player.hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            handContainer.appendChild(cardElement);
        });
    }
    
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.index = index;
        
        // Check if card can be played
        const canPlay = this.player.energy >= card.cost;
        if (!canPlay) {
            cardDiv.classList.add('disabled');
        }
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <div class="card-cost">${card.cost}</div>
                <div class="card-type ${card.type}">${card.type.toUpperCase()}</div>
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-description">${card.description}</div>
            ${card.damage > 0 ? `<div class="card-damage">${card.damage} DMG</div>` : ''}
        `;
        
        cardDiv.addEventListener('click', () => {
            if (canPlay) {
                this.selectCard(index);
            }
        });
        
        return cardDiv;
    }
    
    selectCard(index) {
        const card = this.player.hand[index];
        if (this.player.energy >= card.cost) {
            this.selectedCards.push({ card, index });
            this.player.energy -= card.cost;
            this.player.hand.splice(index, 1);
            
            this.logMessage(`Played: ${card.name}`);
            this.playCard(card);
            this.updateUI();
        }
    }
    
    playCard(card) {
        let damage = card.damage;
        
        // Apply effectiveness based on opponent style and card type
        damage = this.calculateDamage(card, damage);
        
        // Apply card effects
        if (card.effect) {
            this.applyCardEffect(card.effect);
        }
        
        // Deal damage
        if (damage > 0) {
            this.dealDamageToOpponent(damage);
        }
    }
    
    calculateDamage(card, baseDamage) {
        let damage = baseDamage;
        
        // Style effectiveness system
        if (this.opponent.style === 'striker' && card.type === 'takedown') {
            damage *= 1.5; // Takedowns are effective against strikers
            this.logMessage("Super effective against striker!");
        } else if (this.opponent.style === 'grappler' && card.type === 'standup') {
            damage *= 1.5; // Standup is effective against grapplers
            this.logMessage("Super effective against grappler!");
        } else if (this.opponent.style === 'striker' && card.type === 'standup') {
            damage *= 0.75; // Strikers resist standup
            this.logMessage("Not very effective...");
        } else if (this.opponent.style === 'grappler' && card.type === 'takedown') {
            damage *= 0.75; // Grapplers resist takedowns
            this.logMessage("Not very effective...");
        }
        
        return Math.floor(damage);
    }
    
    applyCardEffect(effect) {
        switch (effect) {
            case 'block_5':
                this.player.effects.push({ type: 'block', value: 5, duration: 1 });
                this.logMessage("Blocking 5 damage this turn!");
                break;
            case 'gain_energy_1':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 1);
                this.logMessage("Gained 1 energy!");
                break;
        }
    }
    
    dealDamageToOpponent(damage) {
        this.opponent.health = Math.max(0, this.opponent.health - damage);
        this.showDamageNumber(damage, 'opponent');
        this.logMessage(`${this.opponent.name} takes ${damage} damage!`);
        
        if (this.opponent.health <= 0) {
            this.victory();
        }
    }
    
    dealDamageToPlayer(damage) {
        // Apply blocking effects
        let blockedDamage = 0;
        this.player.effects = this.player.effects.filter(effect => {
            if (effect.type === 'block') {
                const blockAmount = Math.min(damage - blockedDamage, effect.value);
                blockedDamage += blockAmount;
                effect.value -= blockAmount;
                effect.duration -= 1;
                return effect.duration > 0 && effect.value > 0;
            }
            return true;
        });
        
        const finalDamage = Math.max(0, damage - blockedDamage);
        this.player.health = Math.max(0, this.player.health - finalDamage);
        
        if (blockedDamage > 0) {
            this.logMessage(`Blocked ${blockedDamage} damage!`);
        }
        
        if (finalDamage > 0) {
            this.showDamageNumber(finalDamage, 'player');
            this.logMessage(`You take ${finalDamage} damage!`);
        }
        
        if (this.player.health <= 0) {
            this.defeat();
        }
    }
    
    endTurn() {
        if (this.selectedCards.length === 0) {
            this.logMessage("Select at least one card to play!");
            return;
        }
        
        // Opponent's turn
        this.opponentTurn();
        
        // Reset for next turn
        this.player.energy = this.player.maxEnergy;
        this.selectedCards = [];
        
        // Draw new cards to fill hand
        const cardsNeeded = 5 - this.player.hand.length;
        for (let i = 0; i < cardsNeeded && this.player.deck.length > 0; i++) {
            this.player.hand.push(this.player.deck.shift());
        }
        
        this.updateUI();
    }
    
    opponentTurn() {
        const move = this.selectOpponentMove();
        this.logMessage(`${this.opponent.name} uses ${move.name}!`);
        
        let damage = move.damage;
        
        // Apply opponent's move effects
        if (move.effect === 'block_all') {
            this.logMessage(`${this.opponent.name} blocks all damage!`);
            return;
        }
        
        if (damage > 0) {
            this.dealDamageToPlayer(damage);
        }
    }
    
    selectOpponentMove() {
        // Simple AI: prefer moves that opponent is good at
        const availableMoves = this.opponent.moves;
        let weights = [];
        
        availableMoves.forEach(move => {
            let weight = 1;
            
            // Champion uses special logic
            if (this.opponent.style === 'champion') {
                if (this.opponent.health < this.opponent.maxHealth * 0.3) {
                    // Low health, prefer powerful attacks
                    weight = move.damage > 15 ? 3 : 1;
                }
            } else if (this.opponent.style === 'striker' && move.type === 'standup') {
                weight = 2;
            } else if (this.opponent.style === 'grappler' && move.type === 'takedown') {
                weight = 2;
            } else if (this.opponent.style === 'technical') {
                weight = 1.5; // Technical fighters are consistent
            }
            
            weights.push(weight);
        });
        
        // Weighted random selection
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < availableMoves.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return availableMoves[i];
            }
        }
        
        return availableMoves[0]; // Fallback
    }
    
    victory() {
        this.logMessage(`Victory! ${this.opponent.name} is defeated!`);
        
        if (this.currentFight >= this.maxFights) {
            this.logMessage("🏆 CHAMPION! You've conquered the Octagon!");
            this.gamePhase = 'complete';
            return;
        }
        
        // Show card selection for deck building
        this.showCardRewards();
    }
    
    defeat() {
        this.logMessage("💀 Defeated! Train harder and try again.");
        this.gamePhase = 'defeat';
        
        // Show restart option
        setTimeout(() => {
            if (confirm("You were defeated! Start over from the beginning?")) {
                location.reload();
            }
        }, 2000);
    }
    
    showCardRewards() {
        const rewardCards = this.generateRewardCards();
        const modal = document.getElementById('deck-modal');
        const choicesContainer = document.getElementById('card-choices');
        
        choicesContainer.innerHTML = '';
        
        rewardCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardElement.addEventListener('click', () => {
                cardElement.classList.toggle('selected');
            });
            choicesContainer.appendChild(cardElement);
        });
        
        modal.style.display = 'block';
        this.rewardCards = rewardCards;
    }
    
    generateRewardCards() {
        const allCards = [
            { name: "Heavy Cross", type: "standup", cost: 3, damage: 14, description: "Powerful overhand punch" },
            { name: "Head Kick", type: "standup", cost: 4, damage: 16, description: "High risk, high reward" },
            { name: "Superman Punch", type: "standup", cost: 3, damage: 12, description: "Flashy jumping strike" },
            { name: "Double Jab", type: "standup", cost: 2, damage: 8, description: "Two quick punches" },
            { name: "Uppercut", type: "standup", cost: 2, damage: 11, description: "Rising punch to the chin" },
            
            { name: "Hip Toss", type: "takedown", cost: 3, damage: 12, description: "Throws opponent down hard" },
            { name: "Ankle Pick", type: "takedown", cost: 2, damage: 8, description: "Quick takedown attempt" },
            { name: "Slam", type: "takedown", cost: 4, damage: 15, description: "Brutal takedown" },
            { name: "Sweep", type: "takedown", cost: 2, damage: 9, description: "Trips opponent" },
            
            { name: "Clinch Strike", type: "both", cost: 3, damage: 10, description: "Works in any position" },
            { name: "Submission", type: "takedown", cost: 4, damage: 18, description: "High damage grappling" },
            { name: "Counter", type: "both", cost: 2, damage: 8, description: "Defensive attack" },
            
            { name: "Focus", type: "neither", cost: 1, damage: 0, description: "Draw 2 cards", effect: "draw_2" },
            { name: "Meditation", type: "neither", cost: 0, damage: 0, description: "Restore 8 health", effect: "heal_8" },
            { name: "Power Stance", type: "neither", cost: 2, damage: 0, description: "Next attack deals +5 damage", effect: "power_up" }
        ];
        
        // Select 3 random cards for reward
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }
    
    confirmCardSelection() {
        const selectedElements = document.querySelectorAll('#card-choices .card.selected');
        
        selectedElements.forEach(element => {
            const index = parseInt(element.dataset.index);
            const card = this.rewardCards[index];
            this.player.deck.push(card);
            this.logMessage(`Added ${card.name} to your deck!`);
        });
        
        document.getElementById('deck-modal').style.display = 'none';
        
        // Next fight
        this.currentFight++;
        this.startFight();
    }
    
    showDamageNumber(damage, target) {
        const container = target === 'player' ? 
            document.getElementById('player-area') : 
            document.getElementById('opponent-area');
        
        const damageDiv = document.createElement('div');
        damageDiv.className = 'damage-number';
        damageDiv.textContent = `-${damage}`;
        damageDiv.style.left = `${Math.random() * 50 + 25}px`;
        damageDiv.style.top = `${Math.random() * 20 + 10}px`;
        
        container.appendChild(damageDiv);
        
        setTimeout(() => {
            container.removeChild(damageDiv);
        }, 1000);
    }
    
    logMessage(message) {
        const logContent = document.getElementById('log-content');
        const p = document.createElement('p');
        p.textContent = message;
        logContent.appendChild(p);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 10 messages
        while (logContent.children.length > 10) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    showDeck() {
        const deckList = this.player.deck.map(card => `${card.name} (${card.type})`).join('\n');
        alert(`Your Deck (${this.player.deck.length} cards):\n\n${deckList}`);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});