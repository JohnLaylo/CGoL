class CGoL extends HTMLElement {
    constructor() {
        super();
        this._rows = 10;
        this._cols = 10;
        this.createGridSegments();
    }

    createGridSegments() {
        var container = document.getElementById("cgolContainer");
        var cell = document.createElement("div");
        cell.setAttribute("class", "text-center");
        document.body.insertBefore(cell, container);
        for (var i = 0; i < rows; i++) {
            var div1 = document.createElement('div');
            div1.id = "height" + i;
            for (var j = 0; j < cols; j++) {
                var div = document.createElement("div");
                div.setAttribute("class", "dead");
                div.style.width = "20px";
                div.style.height = "20px";
                div.style.background = "gray";
                div.style.display = 'inline-block';
                div.style.margin = '0px';
                div.style.border = '0.5px solid black';
                let id = i + "|" + j;
                div.id = id;
                div.onclick = () => this.segmentClicked(id);
                div1.appendChild(div);
            }

            div1.style.height = "20px";
            cell.appendChild(div1);
        }
    }

    connectedCallback() {
        this.root = this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `

<div  id="cgolContainer" style="display: inline-block; ">
</div> 
`;
    }

    disconnectedCallback() {
        console.log('cgol-pitch disconnected');
    }

    get rows() {
        return this._rows;
    }

    set rows(value) {
        this._rows = value;
        this.setAttribute('width', value);
    }


    get cols() {
        return this._cols;
    }

    set cols(value) {
        this._cols = value;
        this.setAttribute('value', value);
    }

    getGridColumns() {
        let columns = '';
        let width = 10;

        for (let i = 0; i < this.width; i++) {
            if (i > 0) {
                columns += ' ';
            }

            columns += ' 20px';
        }

        return columns;
    }

    segmentClicked(id) {
        var item = document.getElementById(id);
        var rowcol = id.split('|');
        var row = rowcol[0];
        var col = rowcol[1];
        var classes = item.getAttribute('class');

        if (classes.indexOf('live') > -1) {
            item.setAttribute('class', 'dead');
            item.style.background = 'gray';
            grid[row][col] = 0;
        } else {
            item.setAttribute('class', 'live');
            grid[row][col] = 1;
            item.style.background = 'red';
        }
    }
}

var rows = 10;
var cols = 10;
var generation = 0;
var playing = false;
var endGameValidity = false;
var grid = new Array(rows);
var nextGrid = new Array(rows);
var timer;
var reproductionTime = 100;

function initializeGrids() {

    let cgol = document.getElementById('cgol');
    cgol.height = rows;
    cgol.width = cols;

    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

function resetGrids() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
}

function copyAndResetGrid() {

    let generationValidity = false;

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {

            if (grid[i][j] != nextGrid[i][j]) {
                generationValidity = true;
            }

            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }

    if (!generationValidity) {
        clearButtonPressed();
    }
}

function initialize() {
    initializeGrids();
    resetGrids();
    setupInteractions();
}

function refreshView() {

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "|" + j);
            if (grid[i][j] == 0) {
                cell.setAttribute("class", "dead");
                if (cell.style.background === "red" || cell.style.background === "lightgrey") {
                    cell.style.background = "lightgrey";
                }
                else {
                    cell.style.background = "grey";
                }
            } else {
                cell.setAttribute("class", "live");
                cell.style.background = "red";
            }
        }
    }

    if (playing) {
        var generations = document.getElementById("generations");
        generation = generation + 1;
        generations.innerHTML = generation;
    }

}

function setupInteractions() {
    var rowsInput = document.getElementById("rowsInput");
    rowsInput.value = rows;
    var colsInput = document.getElementById("colsInput");
    colsInput.value = cols;
    var generations = document.getElementById("generations");
    generations.innerHTML = generation;
    var startButton = document.getElementById("startButton");
    startButton.onclick = startButtonPressed;
    var clearButton = document.getElementById("clearButton");
    clearButton.onclick = clearButtonPressed;
    var randomButton = document.getElementById("randomButton");
    randomButton.onclick = randomButtonPressed;
    var columnRowButton = document.getElementById("columnRowButton");
    columnRowButton.onclick = refreshRowsandColumns;
    var createTableButton = document.getElementById("createTableButton");
    createTableButton.onclick = createTable;
}

function createTable() {

    if (playing) {
        return;
    }

    let cgol = document.getElementById("cgol");
    var textarea = document.getElementById('textarea').value;
    let newRowsString = textarea.split('\n');
    let newRows = newRowsString.length;
    let temp = 0;

    for (let i = 0; i < newRows; i++) {
        let number = newRowsString[i];

        if (temp < number.length) {
            temp = number.length;
        }
    }

    let newCols = temp;

    if (newCols < 10 || newRows < 10) {
        var textareaLabel = document.getElementById("textareaLabel");
        textareaLabel.innerHTML = "Error! Columns and Rows must be greater than 10!";
        return;
    }
    else {
        var textareaLabel = document.getElementById("textareaLabel");
        textareaLabel.innerHTML = "";
    }

    for (var i = 0; i < cgol.rows; i++) {
        var row = document.getElementById("height" + i);
        row.remove();
    }

    cgol.rows = newRows;
    cgol.cols = newCols;
    rows = newRows;
    cols = newCols;
    grid = new Array(rows);
    nextGrid = new Array(rows);
    initializeGrids();
    cgol.createGridSegments();

    for (let i = 0; i < rows; i++) {

        let number = newRowsString[i];

        for (let j = 0; j < cols; j++) {

            if (number[j] === '1') {
                cgol.segmentClicked(i + "|" + j);
            }
        }
    }
}

function randomButtonPressed() {

    if (playing) {
        return;
    }

    clearButtonPressed();

    for (var i = 0; i < rows; i++) {

        for (var j = 0; j < cols; j++) {
            var isLive = Math.round(Math.random());

            if (isLive == 1) {
                var cell = document.getElementById(i + "|" + j);
                cell.setAttribute("class", "live");
                cell.style.background = "red";
                grid[i][j] = 1;
            }
        }
    }
}

function clearButtonPressed() {
    endGameValidity = false;
    playing = false;
    generation = 0;
    var startButton = document.getElementById('startButton');
    startButton.innerHTML = "Start";
    clearTimeout(timer);
    resetCGoLComponentColor();
    resetGrids();
}

function resetCGoLComponentColor() {
    var cgol = document.getElementById("cgolContainer");

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "|" + j);
            cell.style.background = "grey";
            cell.setAttribute("class", "dead");
        }
    }
}

function startButtonPressed() {
    if (playing) {
        playing = false;
        this.innerHTML = "Continue";
        clearTimeout(timer);
    } else {

        if (!endGameValidity) {
            var generations = document.getElementById("generations");
            generations.innerHTML = generation;
            endGameValidity = true;
        }

        playing = true;
        this.innerHTML = "Pause";
        play();
    }
}

function play() {
    createNextGeneration();

    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

function createNextGeneration() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            applyRules(i, j);
        }
    }

    copyAndResetGrid();
    refreshView();
}

function applyRules(row, col) {

    var numNeighbors = countNeighbors(row, col);

    if (grid[row][col] == 1) {

        if (numNeighbors < 2) {
            nextGrid[row][col] = 0;
        } else if (numNeighbors == 2 || numNeighbors == 3) {
            nextGrid[row][col] = 1;
        } else if (numNeighbors > 3) {
            nextGrid[row][col] = 0;
        }

    } else if (grid[row][col] == 0) {

        if (numNeighbors == 3) {
            nextGrid[row][col] = 1;
        }
    }
}

function refreshRowsandColumns() {

    if (playing) {
        return;
    }

    let cgol = document.getElementById("cgol");

    for (var i = 0; i < cgol.rows; i++) {
        var row = document.getElementById("height" + i);
        row.remove();
    }

    let newRows = document.getElementById("rowsInput");
    let newCols = document.getElementById("colsInput");

    if (newRows.value < 10 || newCols.value < 10) {
        let newRows = document.getElementById("rowsInput");
        let newCols = document.getElementById("colsInput");
        newRows.value = 10;
        newCols.value = 10;
    }

    cgol.rows = newRows.value;
    cgol.cols = newCols.value;
    rows = newRows.value;
    cols = newCols.value;
    grid = new Array(rows);
    nextGrid = new Array(rows);
    initializeGrids();
    cgol.createGridSegments();
}


function countNeighbors(row, col) {
    let sum = 0;

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            let col2 = (col + i + Number(cols)) % Number(cols);
            let row2 = (row + j + Number(rows)) % Number(rows);

            sum += grid[row2][col2];
        }
    }

    sum -= grid[row][col];
    return sum;
}

window.onload = initialize;
window.customElements.define('cgol-pitch', CGoL);
