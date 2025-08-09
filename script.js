document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const participantInputsDiv = document.getElementById('participant-inputs');
    const addParticipantButton = document.getElementById('add-participant-button');
    const nameLampsDiv = document.getElementById('name-lamps');
    const resultList = document.getElementById('result-list');

    const setupArea = document.querySelector('.setup-area');
    const rouletteArea = document.getElementById('roulette-area');
    const resultArea = document.getElementById('result-area');

    const prizes = {
        prize1: document.getElementById('prize1'),
        prize2: document.getElementById('prize2'),
        prize3: document.getElementById('prize3'),
        prizePart: document.getElementById('prize-part'),
    };

    let participants = [];
    let remainingParticipants = [];
    let participantCount = 0;

    function addParticipantFields(count) {
        for (let i = 0; i < count; i++) {
            participantCount++;
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `参加者 ${participantCount}`;
            input.className = 'participant-input';
            participantInputsDiv.appendChild(input);
        }
    }

    addParticipantButton.addEventListener('click', () => {
        addParticipantFields(10);
    });

    startButton.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.participant-input');
        const names = Array.from(inputs).map(input => input.value.trim()).filter(name => name);
        
        if (names.length < 4) {
            alert('有効な名前を持つ参加者を4名以上入力してください。');
            return;
        }
        participants = names;
        remainingParticipants = [...participants];

        setupArea.classList.add('hidden');
        rouletteArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        resultList.innerHTML = '';

        startLottery();
    });

    function startLottery() {
        drawPrize('1等', 'prize-1', prizes.prize1.value, () => {
            drawPrize('2等', 'prize-2', prizes.prize2.value, () => {
                drawPrize('3等', 'prize-3', prizes.prize3.value, () => {
                    assignParticipationPrizes(() => {
                        rouletteArea.classList.add('hidden');
                        resultArea.classList.remove('hidden');
                    });
                });
            });
        });
    }

    function drawPrize(prizeRank, prizeClass, prizeName, callback) {
        updateLamps();
        runRoulette(winner => {
            triggerConfetti();
            const li = document.createElement('li');
            li.textContent = `${prizeRank}: ${winner} (景品: ${prizeName})`;
            li.className = prizeClass;
            resultList.appendChild(li);

            remainingParticipants = remainingParticipants.filter(p => p !== winner);
            
            setTimeout(() => {
                if (callback) callback();
            }, 1000); // Wait a bit before next draw
        });
    }

    function assignParticipationPrizes(callback) {
        remainingParticipants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = `参加賞: ${participant} (景品: ${prizes.prizePart.value})`;
            li.className = 'prize-participation';
            resultList.appendChild(li);
        });
        if(callback) callback();
    }

    function updateLamps() {
        nameLampsDiv.innerHTML = '';
        remainingParticipants.forEach(name => {
            const lamp = document.createElement('div');
            lamp.className = 'lamp';
            lamp.textContent = name;
            nameLampsDiv.appendChild(lamp);
        });
    }

    function runRoulette(onComplete) {
        const lamps = Array.from(nameLampsDiv.children);
        if (lamps.length === 0) {
            if(onComplete) onComplete(null);
            return;
        }

        const duration = 5000; // 5 seconds for more drama
        const totalRotations = 50;
        const winnerIndex = Math.floor(Math.random() * lamps.length);

        lamps.forEach(lamp => lamp.classList.remove('active'));

        let currentRotation = 0;

        function animate(time) {
            const progress = time / duration;
            const easedProgress = easeOutCubic(progress);

            const currentIndex = Math.floor(easedProgress * totalRotations) % lamps.length;
            
            lamps.forEach((lamp, index) => {
                lamp.classList.toggle('active', index === currentIndex);
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final winner is selected
                lamps.forEach(lamp => lamp.classList.remove('active'));
                lamps[winnerIndex].classList.add('active');
                setTimeout(() => onComplete(lamps[winnerIndex].textContent), 500);
            }
        }

        requestAnimationFrame(animate);
    }

    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    function triggerConfetti() {
        confetti({
            particleCount: 150,
            spread: 180,
            origin: { y: 0.6 }
        });
    }

    // Initial setup
    addParticipantFields(10);
});