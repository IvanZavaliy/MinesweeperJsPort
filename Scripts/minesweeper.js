let minefieldWidth = 10;
let minefieldHeight = 10;
let mineAmount = 10;
let grid = [];
let isGameFinished = false;
let openedCellsCount = 0;

const minefield = document.getElementById("minefield");
const dialog = document.getElementById("dialog");

document.getElementById("minefieldGenerator").addEventListener("click", () => {
    minefieldWidth = parseInt(document.getElementById("minefieldWidth").value);
    minefieldHeight = parseInt(document.getElementById("minefieldHeight").value);

    mineAmount = parseInt(document.getElementById("mineCount").value);

    startGame();
})

document.getElementById("dialogButton").addEventListener("click", () => {
    dialog.close();
    startGame();
})

function startGame() {
    resetMinefield();
    setupMinefield();
}

function resetMinefield() {
    isGameFinished = false;
    openedCellsCount = 0;
    grid = [];
    minefield.innerHTML = "";
}

function setupMinefield() {
    minefield.style.gridTemplateColumns = `repeat(${minefieldHeight}, 30px)`;

    createMinefield();
    mineGenerator();
    calculateNeighbours();
}

function createMinefield() {
    for (let row = 0; row < minefieldWidth; row++) {
        const rowArr = [];
        for (let col = 0; col < minefieldHeight; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            const cellData = {
                element: cell,
                row: row,
                col: col,
                isMine: false,
                mineCount: 0,
                isOpened: false,
                isFlagged: false
            }

            // create click event listener
            cell.addEventListener("click", () => openCell(cellData));
            cell.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                setFlag(cellData);
            });

            rowArr.push(cellData);
            minefield.appendChild(cell);
        }
        grid.push(rowArr);
    }
}

function mineGenerator() {
    let minesPlacedCount = 0;

    while (minesPlacedCount < mineAmount) {
        const row = Math.floor(Math.random() * minefieldWidth);
        const col = Math.floor(Math.random() * minefieldHeight);

        if (!grid[row][col].isMine) {
            grid[row][col].isMine = true;
            minesPlacedCount++;
        }
    }
}

function calculateNeighbours() {
    for (let row = 0; row < minefieldWidth; row++) {
        for (let col = 0; col < minefieldHeight; col++) {
            const cellData = grid[row][col];

            if (cellData.isMine)
                continue;

            let mineCount = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const neighbourRow = row + x;
                    const neighbourCol = col + y;

                    if (isInsideGrid(neighbourRow, neighbourCol)) {
                        if (grid[neighbourRow][neighbourCol].isMine) {
                            mineCount++;
                        }
                    }
                }
            }

            cellData.mineCount = mineCount;
        }
    }
}

function isInsideGrid(row, col) {
    return row >= 0 && row < minefieldWidth && col >= 0 && col < minefieldHeight;
}

function openCell(cellData) {
    if (isGameFinished || cellData.isOpened)
        return;

    const cell = cellData.element;

    if (cellData.isFlagged) {
        cellData.isFlagged = false;
        cell.classList.remove("flagged");
    }

    cellData.isOpened = true;
    openedCellsCount++;
    cell.classList.add("revealed");

    if (cellData.isMine) {
        isGameFinished = true;
        openAllMines();
        showDialog("Game over");
        return;
    }

    if (cellData.mineCount > 0)
        cell.textContent = cellData.mineCount;
    else
        openNeighbours(cellData.row, cellData.col);

    checkWinCondition();
}

function openAllMines() {
    for (let row = 0; row < minefieldWidth; row++) {
        for (let col = 0; col < minefieldHeight; col++) {
            const cellData = grid[row][col];

            if (cellData.isMine) {
                cellData.element.classList.add("revealed");
                cellData.element.classList.add("mine");
            }
        }
    }
}

function openNeighbours(row, col) {
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const neighbourRow = row + x;
            const neighbourCol = col + y;

            if (isInsideGrid(neighbourRow, neighbourCol))
            {
                const neighbour = grid[neighbourRow][neighbourCol];

                if (!neighbour.isOpened && !neighbour.isMine) {
                    if (neighbour.isFlagged)
                    {
                        neighbour.isFlagged = false;
                        neighbour.element.classList.remove("flagged");
                    }

                    neighbour.isOpened = true;
                    neighbour.element.classList.add("revealed");
                    openedCellsCount++;
                    if (neighbour.mineCount === 0)
                        openNeighbours(neighbourRow, neighbourCol);
                    else
                        neighbour.element.textContent = neighbour.mineCount;
                }
            }
        }
    }
}

function checkWinCondition() {
    if (openedCellsCount === (minefieldWidth * minefieldHeight - mineAmount)) {
        isGameFinished = true;
        showDialog("You win");
    }
}

function showDialog(message) {
    document.getElementById("dialogMassage").textContent = message;
    dialog.showModal();
}

function setFlag(cellData) {
    if (isGameFinished || cellData.isOpened) {
        return;
    }

    cellData.isFlagged = !cellData.isFlagged;
    cellData.element.classList.toggle("flagged");
}