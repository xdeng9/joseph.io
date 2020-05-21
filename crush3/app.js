document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('.score');
    const gameBtn = document.querySelector('.play-game');
    const sound = document.querySelector('.toggle-sound');
    const instruction = document.querySelector('.instruction-container');
    instruction.addEventListener('click', handleModal);
    gameBtn.addEventListener('click', startGame);
    const width = 8;
    const cells = [];
    let themeSelect = document.getElementById('themes');
    themeSelect.addEventListener('change', handleTheme);
    let player = document.getElementById('audio-player');
    let countDownDisplay = document.querySelector('.count-down');
    let curLevel = 1, prevLevel = 0;
    let theme = 'fruits'
    let gameOn = null;
    let colorDragged, colorReplaced, squareDragged, squareToBeReplaced;
    let score = 0, time = 60, timer = null;
    let gameLoop = null;

    function createGrid() {
        for (let i = 0; i < width * width; i++) {
            const cell = document.createElement('div');
            cell.style.backgroundImage = getRandImage();
            grid.appendChild(cell);
            cells.push(cell);
            
            cell.setAttribute('id', i);
        }
    }

    function updateScore() {
        scoreDisplay.innerHTML = score;
    }

    function getRandImage() {
        const animals = [
            'url(images/cat.png)',
            'url(images/pig.png)',
            'url(images/mouse.png)',
            'url(images/chick.png)',
            'url(images/rabbit.png)',
            'url(images/fox.png)',
        ];

        const fruits = [
            'url(images/banana.png)',
            'url(images/lime.png)',
            'url(images/orange.png)',
            'url(images/plum.png)',
            'url(images/strawberry.png)',
            'url(images/watermelon.png)',
        ];

        const pirates = [
            'url(images/p1.png)',
            'url(images/p2.png)',
            'url(images/p3.png)',
            'url(images/p4.png)',
            'url(images/p5.png)',
            'url(images/p6.png)',
        ]

        let images = [];
        if (theme === 'animals') 
            images = animals;
        else if (theme === 'fruits') 
            images = fruits
        else images = pirates;

        let randomImage = Math.floor(Math.random() * images.length);
        return images[randomImage];
    }

    function dragStart() {
        colorDragged = this.style.backgroundImage;
        squareDragged = parseInt(this.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave(e) {
        e.preventDefault();
    }

    function dragDrop() {
        colorReplaced = this.style.backgroundImage;
        squareToBeReplaced = parseInt(this.id);
        this.style.backgroundImage = cells[squareDragged].style.backgroundImage;
        cells[squareDragged].style.backgroundImage = colorReplaced;
    }
    
    function haveMatch(index) {
        let image = cells[index].style.backgroundImage;
        let count = 1;
        let row = Math.floor(index / width);
        let pos = index - 1;
    
        while (pos >= 0 && Math.floor(pos / width) === row) {
            if (cells[pos].style.backgroundImage === image)
                count++;
            else break;
            pos--;
        }
        if (count >= 3) return true;

        pos = index + 1;
        while (pos < cells.length && Math.floor(pos / width) === row) {
            if (cells[pos].style.backgroundImage === image)
                count++;
            else break;
            pos++;
        }
        if (count >= 3) return true;

        count = 1;
        pos = index - width;
        while (pos >= 0) {
            if (cells[pos].style.backgroundImage === image)
                count++;
            else break;
            pos -= width;
        }
        if (count >= 3) return true;

        pos = index + width;
        while (pos < cells.length) {
            if (cells[pos].style.backgroundImage === image)
                count++;
            else break;
            pos += width;
        }
        if (count >= 3) return true;

        return false;
    }

    function dragEnd() {
        let validMoves = [
            squareDragged - 1,
            squareDragged + 1,
            squareDragged + width,
            squareDragged - width
        ];

        if (squareToBeReplaced !== undefined && validMoves.includes(squareToBeReplaced) 
            && haveMatch(squareToBeReplaced)) {
            document.getElementById('audio-player2').play();
        } else {
            cells[squareDragged].style.backgroundImage = colorDragged;
            cells[squareToBeReplaced].style.backgroundImage = colorReplaced;
        }
    }

    function dropdown() {
        let end = width * (width - 1);
        for (let i = 0; i < end; i++) {
            if (cells[i + width].style.backgroundImage === '') {
                cells[i + width].style.backgroundImage = cells[i].style.backgroundImage;
                cells[i].style.backgroundImage = '';
            }

            if (Math.floor(i / width) === 0 && cells[i].style.backgroundImage === '') {
                cells[i].style.backgroundImage = getRandImage();
            }
        }
    }

    function checkColMatch() {
        let matchedCells = [];
        for (let i = 0; i < width; i++) {
            for (let j = i; j < width * (width - 1) + i; j+= width) {
                if (cells[j].style.backgroundImage === cells[j + width].style.backgroundImage) {
                    if (matchedCells.length === 0) {
                        matchedCells.push(j);
                        matchedCells.push(j + width);
                    } else matchedCells.push(j + width);

                    if (j + width === width * (width - 1) + i && matchedCells.length >= 3) {
                        for (let cell of matchedCells) cells[cell].style.backgroundImage = '';
                        score += matchedCells.length;
                    }
                } else {
                    if (matchedCells.length >= 3) {
                        for (let cell of matchedCells) cells[cell].style.backgroundImage = '';
                        score += matchedCells.length;
                    }
                    matchedCells = [];
                }
            }
            matchedCells = [];
        } 
    }

    function checkRowMatch() {
        let matchedCells = [];
        for (let i = 1; i < width * width; i++) {
            if (cells[i].style.backgroundImage === cells[i - 1].style.backgroundImage
                && Math.floor(i / width) === Math.floor((i - 1) / width)) {
                    if (matchedCells.length === 0) {
                        matchedCells.push(i - 1);
                        matchedCells.push(i);
                    } else matchedCells.push(i);
                } else {
                    if (matchedCells.length >= 3) {
                        for (let cell of matchedCells) cells[cell].style.backgroundImage = '';
                        score += matchedCells.length;
                    }
                    matchedCells = [];
                }
        }

        if (matchedCells.length >= 3) {
            for (let cell of matchedCells) cells[cell].style.backgroundImage = '';
            score += matchedCells.length;
        }
    }

    function toggleSound() {
        if (player.paused) {
            player.play();
            sound.innerHTML = 'Sound Off'
        }
        else {
            player.pause();
            sound.innerHTML = 'Sound On'
        }
    }

    function handleTheme() {
        theme = themeSelect.options[themeSelect.selectedIndex].value;
        for (let cell of cells) cell.style.backgroundImage = getRandImage();
    }

    function checkLevels() {
        let levelDisplay = document.querySelector('.level');
        let nextLevelDisplay = document.querySelector('.next-score');

        if (time === 0) {
            clearInterval(gameLoop);
            if (!player.paused) player.pause();
            setTimeout(() => {
                countDownDisplay.innerHTML = 0;
                gameOver();
            }, 1000)
        }

        if (score >= 150) {
            curLevel = 2;
            levelDisplay.innerHTML = 'Level: 2';
            nextLevelDisplay.innerHTML = 300;
        }  

        if (score >= 300) {
            curLevel = 3;
            levelDisplay.innerHTML = 'Level: 3';
            nextLevelDisplay.innerHTML = 450;
        } 
        
        if (score >= 450) {
            curLevel = 4;
            levelDisplay.innerHTML = 'Level: 4';
            nextLevelDisplay.innerHTML = 600;
        }

        if (score >= 600) {
            curLevel = 5;
            levelDisplay.innerHTML = 'Level: 5';
            nextLevelDisplay.innerHTML = 800;
        } 

        if (score >= 800) {
            curLevel = 6;
            levelDisplay.innerHTML = 'Level: 6';
            nextLevelDisplay.innerHTML = 1000;
        } 

        if (score >= 1000) {
            curLevel = 7;
            levelDisplay.innerHTML = 'Level: 7';
            nextLevelDisplay.innerHTML = 1250;
        }

        if (score >= 1250) {
            clearInterval(gameLoop);
            if (!player.paused) player.pause();
            setTimeout(() => {
                gameWon();
            }, 1000)
        }

        setTimer()
    }

    function setTimer() {
        if (curLevel === prevLevel) return;
        clearInterval(timer);
        
        switch(curLevel) {
            case 1:
                time = time;
                break;
            case 2:
                time += 30;
                break;
            case 3:
                time += 30;
                break;
            case 4:
                time += 30;
                break;
            case 5:
                time += 25;
                break;
            case 6:
                time += 20;
                break;
            case 7:
                time += 20;             
                break;
        }
        countDownDisplay.innerHTML = time;
        time--;

        timer = setInterval(() => {
            countDownDisplay.innerHTML = time;
            time--;
        }, 1000)
        prevLevel = curLevel;
    }

    function gameWon() {
        clearInterval(timer);
        alert('Congratulations!!! You won!')
        resetGame();
    }

    function gameOver() { 
        clearInterval(timer);
        alert(`Time is up... your score is ${score}`);
        resetGame();
    }

    function addListners() {
        for (let cell of cells) {
            cell.setAttribute('draggable', true);
            cell.addEventListener('dragstart', dragStart);
            cell.addEventListener('dragover', dragOver)
            cell.addEventListener('dragenter', dragEnter);
            cell.addEventListener('dragleave', dragLeave);
            cell.addEventListener('drop', dragDrop);
            cell.addEventListener('dragend', dragEnd);
        }
    }

    function removeListners() {
        for (let cell of cells) {
            cell.setAttribute('draggable', false);
            cell.removeEventListener('dragstart', dragStart);
            cell.removeEventListener('dragover', dragOver)
            cell.removeEventListener('dragenter', dragEnter);
            cell.removeEventListener('dragleave', dragLeave);
            cell.removeEventListener('drop', dragDrop);
            cell.removeEventListener('dragend', dragEnd);
        }
    }

    function resetGame() {
        time = 60;
        document.querySelector('.play-game').innerHTML = 'Start Game';
        document.querySelector('.next-score').innerHTML = 150;
        document.querySelector('.level').innerHTML = 'Level: 1';
        countDownDisplay.innerHTML = time;
        sound.innerHTML = 'Sound Off'
        score = 0;
        curLevel = 1;
        prevLevel = 0;
        gameOn = null;
        updateScore();
        removeListners();
        sound.removeEventListener('click', toggleSound);
        themeSelect.disabled = false;
    }

    createGrid();
    score = 0;
    function startGame() {
        if (gameOn === null) {
            gameOn = true
            setTimer();
            themeSelect.disabled = true;
            addListners();
            sound.addEventListener('click', toggleSound);
            toggleSound();

            document.querySelector('.play-game').innerHTML = 'Pause';

            gameLoop = setInterval(() => {
                            dropdown();
                            checkColMatch();
                            checkRowMatch();
                            updateScore();
                            checkLevels()
                        }, 123);

        } else if (gameOn) {
            clearInterval(timer);
            document.querySelector('.play-game').innerHTML = 'Resume';
            removeListners();
            gameOn = false
        } else {
            --prevLevel;
            setTimer();
            document.querySelector('.play-game').innerHTML = 'Pause';
            addListners();
            gameOn = true;
        }
    }

    function handleModal() {
        let modal = document.querySelector('.modal');
        let closeBtn = document.querySelector('.close');
        modal.style.display = 'block';

        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
})