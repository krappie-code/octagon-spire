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
        this.currentTurn = 'player'; // 'player' or 'enemy'
        this.fightPosition = 'standing'; // 'standing' or 'ground'
        this.enemyIntent = null; // { action, damage, description }
        
        this.initializeDeck();
        this.initializeOpponents();
        this.startFight();
        this.setupEventListeners();
    }
    
    initializeDeck() {
        // Simplified starting deck - focus on core combat
        const startingCards = [
            { name: "Jab", type: "strike", cost: 1, damage: 6, description: "Quick straight punch" },
            { name: "Jab", type: "strike", cost: 1, damage: 6, description: "Quick straight punch" }, 
            { name: "Hook", type: "strike", cost: 2, damage: 10, description: "Powerful curved punch" },
            { name: "Low Kick", type: "strike", cost: 2, damage: 8, description: "Targets opponent's legs" },
            { name: "Guard", type: "defense", cost: 1, damage: 0, description: "Block 5 damage this turn", effect: "block_5" },
            { name: "Guard", type: "defense", cost: 1, damage: 0, description: "Block 5 damage this turn", effect: "block_5" },
            { name: "Rest", type: "utility", cost: 0, damage: 0, description: "Gain 1 energy", effect: "gain_energy_1" },
            { name: "Counter", type: "strike", cost: 2, damage: 7, description: "Quick counter attack" },
            { name: "Stand Up", type: "utility", cost: 1, damage: 2, description: "Get back to standing position", effect: "standup", requiresPosition: "ground" },
            { name: "Sprawl", type: "defense", cost: 1, damage: 3, description: "Defend against takedowns", effect: "block_3" }
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
        this.currentTurn = 'player';
        this.fightPosition = 'standing';
        
        // Generate initial enemy intent
        this.generateEnemyIntent();
        
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
        
        // Update turn indicator
        document.getElementById('current-turn').textContent = this.currentTurn === 'player' ? 'YOUR TURN' : 'ENEMY TURN';
        
        // Update fight position
        const positionElement = document.getElementById('fight-position');
        positionElement.textContent = this.fightPosition.toUpperCase();
        positionElement.className = this.fightPosition;
        
        // Update enemy intent
        if (this.enemyIntent) {
            const intentActionEl = document.getElementById('intent-action');
            const intentDamageEl = document.getElementById('intent-damage');
            
            if (intentActionEl && intentDamageEl) {
                intentActionEl.textContent = this.enemyIntent.action;
                intentDamageEl.textContent = this.enemyIntent.damage > 0 ? `${this.enemyIntent.damage} DMG` : 'Special';
                console.log('Updated enemy intent UI:', this.enemyIntent.action, this.enemyIntent.damage); // Debug log
            } else {
                console.error('Enemy intent UI elements not found!'); // Debug error
            }
        }
        
        // Update hand (filter based on position)
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
        
        // Simplified position checking
        const hasEnergy = this.player.energy >= card.cost;
        const hasPosition = !card.requiresPosition || card.requiresPosition === this.fightPosition;
        const canPlay = hasEnergy && hasPosition;
        
        if (!canPlay) {
            cardDiv.classList.add('disabled');
        }
        
        // Add position indicator only for position-specific cards
        let positionInfo = '';
        if (card.requiresPosition) {
            positionInfo = ` (${card.requiresPosition.toUpperCase()} ONLY)`;
        }
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <div class="card-cost">${card.cost}</div>
                <div class="card-type ${card.type}">${card.type.toUpperCase()}</div>
            </div>
            <div class="card-name">${card.name}${positionInfo}</div>
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
            case 'block_3':
                this.player.effects.push({ type: 'block', value: 3, duration: 1 });
                this.logMessage("Blocking 3 damage this turn!");
                break;
            case 'block_8':
                this.player.effects.push({ type: 'block', value: 8, duration: 1 });
                this.logMessage("Blocking 8 damage this turn!");
                break;
            case 'gain_energy_1':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 1);
                this.logMessage("Gained 1 energy!");
                break;
            case 'gain_energy_2':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 2);
                this.logMessage("Gained 2 energy!");
                break;
            case 'heal_8':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 8);
                this.logMessage("Restored 8 health!");
                break;
            case 'draw_2':
                for (let i = 0; i < 2 && this.player.deck.length > 0; i++) {
                    this.player.hand.push(this.player.deck.shift());
                }
                this.logMessage("Drew 2 cards!");
                break;
            case 'standup':
                if (this.fightPosition === 'ground') {
                    this.fightPosition = 'standing';
                    this.logMessage("Got back to standing position!");
                } else {
                    this.logMessage("Already standing!");
                }
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
        // Make turn ending simple and always work
        this.logMessage("--- End of your turn ---");
        this.currentTurn = 'enemy';
        this.updateUI();
        
        // Brief pause to show enemy turn
        setTimeout(() => {
            if (this.opponent.health > 0) {
                this.opponentTurn();
            }
            
            // Generate new enemy intent for next turn
            if (this.opponent.health > 0) {
                this.generateEnemyIntent();
            }
            
            // Back to player turn
            this.currentTurn = 'player';
            this.player.energy = this.player.maxEnergy;
            this.selectedCards = [];
            
            // Draw new cards to fill hand
            const cardsNeeded = 5 - this.player.hand.length;
            for (let i = 0; i < cardsNeeded && this.player.deck.length > 0; i++) {
                this.player.hand.push(this.player.deck.shift());
            }
            
            // Clear temporary effects
            this.player.effects = this.player.effects.filter(effect => {
                effect.duration--;
                return effect.duration > 0;
            });
            
            this.updateUI();
            this.logMessage("--- Your turn begins ---");
        }, 1000); // Shorter delay
    }
    
    opponentTurn() {
        if (!this.enemyIntent) {
            return;
        }
        
        const move = this.enemyIntent.move;
        this.logMessage(`${this.opponent.name} ${this.enemyIntent.description}...`);
        this.logMessage(`${this.opponent.name} uses ${move.name}!`);
        
        let damage = move.damage;
        
        // Apply opponent's move effects
        if (move.effect === 'block_all') {
            this.logMessage(`${this.opponent.name} blocks all damage!`);
            return;
        }
        
        // Handle position changes from enemy moves
        if (move.name === 'Single Leg' || move.name === 'Double Leg' || move.name === 'Body Slam' || move.name === 'Elite Takedown') {
            if (this.fightPosition === 'standing' && Math.random() > 0.4) {
                this.fightPosition = 'ground';
                this.logMessage(`${this.opponent.name} takes you down! You're now on the GROUND!`);
            }
        }
        
        if (damage > 0) {
            this.dealDamageToPlayer(damage);
        }
    }
    
    generateEnemyIntent() {
        const selectedMove = this.selectOpponentMove();
        console.log('Generating enemy intent for:', selectedMove.name); // Debug log
        
        // Create enemy intent with descriptive action text
        let actionText = '';
        let description = '';
        
        switch (selectedMove.name) {
            case 'Jab':
            case 'Wild Swing':
            case 'Weak Jab':
                actionText = '👊 Punch';
                description = 'preparing to strike';
                break;
            case 'Heavy Haymaker':
            case 'Championship Combo':
                actionText = '💥 Power Strike';
                description = 'winding up for big damage';
                break;
            case 'Single Leg':
            case 'Double Leg':
            case 'Basic Grapple':
                actionText = '🤼 Takedown';
                description = 'looking to take you down';
                break;
            case 'Body Slam':
            case 'Elite Takedown':
                actionText = '🤼 Power Slam';
                description = 'preparing devastating takedown';
                break;
            case 'Perfect Defense':
                actionText = '🛡️ Defense';
                description = 'focusing on defense';
                break;
            default:
                actionText = '⚔️ Attack';
                description = 'preparing to strike';
        }
        
        this.enemyIntent = {
            action: actionText,
            damage: selectedMove.damage,
            description: description,
            move: selectedMove
        };
        
        console.log('Enemy intent set:', this.enemyIntent); // Debug log
    }
    
    selectOpponentMove() {
        // Enhanced AI with predictable patterns and some variation
        const availableMoves = this.opponent.moves;
        let weights = [];
        
        // Add some predictability based on opponent patterns
        const turnsSinceStart = this.selectedCards.length; // rough turn counter
        let preferredMoveType = null;
        
        // Each opponent has behavioral patterns
        switch (this.opponent.style) {
            case 'striker':
                // Strikers prefer standup 70% of the time
                preferredMoveType = Math.random() < 0.7 ? 'standup' : null;
                break;
            case 'grappler':
                // Grapplers prefer takedown 70% of the time
                preferredMoveType = Math.random() < 0.7 ? 'takedown' : null;
                break;
            case 'technical':
                // Technical fighters mix it up but prefer counters when player is aggressive
                if (this.selectedCards.length > 1) {
                    preferredMoveType = 'both'; // counter moves
                }
                break;
            case 'champion':
                // Champion adapts based on health
                if (this.opponent.health < this.opponent.maxHealth * 0.3) {
                    preferredMoveType = 'power'; // go for broke
                }
                break;
        }
        
        availableMoves.forEach(move => {
            let weight = 1;
            
            // Apply behavioral preferences
            if (preferredMoveType && move.type === preferredMoveType) {
                weight *= 3;
            } else if (preferredMoveType === 'power' && move.damage > 15) {
                weight *= 3;
            }
            
            // Position-based preferences (we'll enhance this later)
            if (this.fightPosition === 'standing' && move.type === 'standup') {
                weight *= 1.3;
            } else if (this.fightPosition === 'ground' && move.type === 'takedown') {
                weight *= 1.3;
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
            // Striking cards
            { name: "Heavy Cross", type: "strike", cost: 3, damage: 14, description: "Powerful overhand punch" },
            { name: "Head Kick", type: "strike", cost: 4, damage: 16, description: "High risk, high reward" },
            { name: "Superman Punch", type: "strike", cost: 3, damage: 12, description: "Flashy jumping strike" },
            { name: "Double Jab", type: "strike", cost: 2, damage: 8, description: "Two quick punches" },
            { name: "Uppercut", type: "strike", cost: 2, damage: 11, description: "Rising punch to the chin" },
            { name: "Body Shot", type: "strike", cost: 2, damage: 9, description: "Heavy hit to the body" },
            
            // Ground game cards  
            { name: "Ground Strike", type: "ground", cost: 2, damage: 10, description: "Strike while on the ground", requiresPosition: "ground" },
            { name: "Submission", type: "ground", cost: 4, damage: 18, description: "High damage grappling", requiresPosition: "ground" },
            { name: "Escape", type: "utility", cost: 1, damage: 3, description: "Get back to standing", effect: "standup", requiresPosition: "ground" },
            
            // Defense cards
            { name: "Iron Guard", type: "defense", cost: 2, damage: 0, description: "Block 8 damage this turn", effect: "block_8" },
            { name: "Perfect Counter", type: "strike", cost: 3, damage: 12, description: "Defensive counter attack" },
            
            // Utility cards
            { name: "Focus", type: "utility", cost: 1, damage: 0, description: "Gain 2 energy", effect: "gain_energy_2" },
            { name: "Meditation", type: "utility", cost: 0, damage: 0, description: "Restore 8 health", effect: "heal_8" },
            { name: "Adrenaline", type: "utility", cost: 0, damage: 0, description: "Draw 2 cards", effect: "draw_2" }
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
    console.log('🥊 Octagon Spire v2.0 - Core MMA Mechanics loaded!'); // Version indicator
    window.game = new Game();
});