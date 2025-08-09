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

    const prizeCounts = {
        prize1: document.getElementById('prize1-count'),
        prize2: document.getElementById('prize2-count'),
        prize3: document.getElementById('prize3-count'),
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

        const totalWinners = parseInt(prizeCounts.prize1.value) + parseInt(prizeCounts.prize2.value) + parseInt(prizeCounts.prize3.value);

        if (names.length < totalWinners) {
            alert(`参加者の数（${names.length}人）が当選本数の合計（${totalWinners}人）より少ないです。参加者を増やすか、当選本数を減らしてください。`);
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

    async function startLottery() {
        await drawPrizesForRank('1等', 'prize-1', prizes.prize1.value, parseInt(prizeCounts.prize1.value));
        await drawPrizesForRank('2等', 'prize-2', prizes.prize2.value, parseInt(prizeCounts.prize2.value));
        await drawPrizesForRank('3等', 'prize-3', prizes.prize3.value, parseInt(prizeCounts.prize3.value));
        
        assignParticipationPrizes();

        rouletteArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
    }

    function drawPrizesForRank(prizeRank, prizeClass, prizeName, count) {
        return new Promise(async (resolve) => {
            for (let i = 0; i < count; i++) {
                if (remainingParticipants.length === 0) break;
                await drawSinglePrize(prizeRank, prizeClass, prizeName);
            }
            resolve();
        });
    }

    function drawSinglePrize(prizeRank, prizeClass, prizeName) {
        return new Promise((resolve) => {
            updateLamps();
            runRoulette(winner => {
                if (winner) {
                    triggerConfetti();
                    const li = document.createElement('li');
                    li.textContent = `${prizeRank}: ${winner} (景品: ${prizeName})`;
                    li.className = prizeClass;
                    resultList.appendChild(li);
                    remainingParticipants = remainingParticipants.filter(p => p !== winner);
                }
                setTimeout(resolve, 1000); // Wait a bit before next draw
            });
        });
    }

    function assignParticipationPrizes() {
        remainingParticipants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = `参加賞: ${participant} (景品: ${prizes.prizePart.value})`;
            li.className = 'prize-participation';
            resultList.appendChild(li);
        });
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
            if (onComplete) onComplete(null);
            return;
        }

        const duration = 5000;
        const winnerIndex = Math.floor(Math.random() * lamps.length);

        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart

            const totalLaps = 5;
            const totalSteps = lamps.length * totalLaps + winnerIndex;
            const currentStep = Math.floor(easedProgress * totalSteps);
            const currentIndex = currentStep % lamps.length;

            lamps.forEach((lamp, index) => {
                lamp.classList.toggle('active', index === currentIndex);
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                lamps.forEach((lamp, index) => lamp.classList.toggle('active', index === winnerIndex));
                setTimeout(() => onComplete(lamps[winnerIndex].textContent), 500);
            }
        }

        requestAnimationFrame(animate);
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