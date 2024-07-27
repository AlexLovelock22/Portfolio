// Constants and initial setup
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 32;
const displayedWidth = 512;
const displayedHeight = 512;

canvas.width = displayedWidth;
canvas.height = displayedHeight;

let isCurvedLine = true;
let selectedPoints = [{ x: 5, y: 15 }, { x: 25, y: 15 }, { x: 15, y: 5 }];
let draggingPoint = null;

const textures = {
    full: new Image(),
    slabTop: new Image(),
    slabBottom: new Image(),
    stair1: new Image(), // Stair going up right
    stair2: new Image(), // Stair going up left
    stair3: new Image(), // Stair going up down
    stair4: new Image()  // Stair going up up
};

textures.full.src = 'BlockTextures/FullBlock.png';
textures.slabTop.src = 'BlockTextures/TopSlab.png';
textures.slabBottom.src = 'BlockTextures/BottomSlab.png';
textures.stair1.src = 'BlockTextures/Stairs1.png';
textures.stair2.src = 'BlockTextures/Stairs2.png';
textures.stair3.src = 'BlockTextures/Stairs3.png';
textures.stair4.src = 'BlockTextures/Stairs4.png';

// Ensure all textures are loaded before starting
let loadedTextures = 0;
const totalTextures = Object.keys(textures).length;

for (const key in textures) {
    textures[key].onload = () => {
        loadedTextures++;
        if (loadedTextures === totalTextures) {
            console.log("All textures loaded.");
            drawGrid();
            analyzeAndDrawBlocks();
        }
    };
    textures[key].onerror = () => {
        console.error(`Failed to load texture: ${key} from ${textures[key].src}`);
    };
}

// Calculate the coverage of a line segment within a cell
function calculateCoverage(p1, p2) {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance / Math.sqrt(2); // Max distance across one cell
}

function determineBlockType(p1, p2) {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let maxDistance = Math.sqrt(2); // Max diagonal of the cell
    let coverage = distance / maxDistance;

    let slope = Math.abs(dy / dx);

    console.log(`Determining block type with slope: ${slope}, coverage: ${coverage}`);

    if (coverage > 0.8) {
        return 'full';
    } else if (coverage > 0.25) {
        if (slope > 2.0) { // Use stairs for very steep slopes
            return 'stair';
        } else {
            // Use slabs based on the y-position within the cell
            return (p1.y % 1 > 0.5 || p2.y % 1 > 0.5) ? 'slabTop' : 'slabBottom';
        }
    } else if (coverage > 0.1) {
        if (slope > 2.0) { // Apply the same logic for less coverage
            return 'stair';
        } else {
            return (p1.y % 1 > 0.5 || p2.y % 1 > 0.5) ? 'slabTop' : 'slabBottom';
        }
    } else {
        return 'none';
    }
}

// Draw the block on the canvas
function drawBlock(x, y, blockType) {
    let texture;
    switch (blockType) {
        case 'full':
            texture = textures.full;
            break;
        case 'slabTop':
            texture = textures.slabTop;
            break;
        case 'slabBottom':
            texture = textures.slabBottom;
            break;
        case 'stair1':
            texture = textures.stair1;
            break;
        case 'stair2':
            texture = textures.stair2;
            break;
        case 'stair3':
            texture = textures.stair3;
            break;
        case 'stair4':
            texture = textures.stair4;
            break;
        default:
            return;
    }

    if (texture && texture.complete) {
        ctx.drawImage(texture, x * (displayedWidth / gridSize), y * (displayedHeight / gridSize), displayedWidth / gridSize, displayedHeight / gridSize);
    }
}

// Determine the stair block type based on the movement direction
function determineStairBlockType(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'stair1' : 'stair2'; // Horizontal movement
    } else {
        return dy > 0 ? 'stair4' : 'stair3'; // Vertical movement
    }
}

function analyzeAndDrawBlocks() {
    if (selectedPoints.length === 3) {
        let [p1, p2, cp] = selectedPoints;

        let steps = 100; // Number of steps to approximate the curve
        ctx.beginPath();

        // Store all points used for both block placement and debug line drawing
        let curvePoints = [];

        for (let step = 0; step <= steps; step++) {
            let t = step / steps;
        
            // Quadratic Bezier Curve formula
            let x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cp.y + t * t * p2.y;

            curvePoints.push({ x, y });
        
            // Use rounding instead of flooring
            let gridX = Math.round(x);
            let gridY = Math.round(y);
        
            let nextT = Math.min(1, t + 1 / steps);
            let nextX = (1 - nextT) * (1 - nextT) * p1.x + 2 * (1 - nextT) * nextT * cp.x + nextT * nextT * p2.x;
            let nextY = (1 - nextT) * (1 - nextT) * p1.y + 2 * (1 - nextT) * nextT * cp.y + nextT * nextT * p2.y;
        
            let blockType = determineBlockType({x: x, y: y}, {x: nextX, y: nextY});
        
            console.log(`Step ${step}: x=${x}, y=${y}, gridX=${gridX}, gridY=${gridY}, blockType=${blockType}`);
        
            if (blockType === 'stair') {
                blockType = determineStairBlockType({x: x, y: y}, {x: nextX, y: nextY});
                drawBlock(gridX, gridY, blockType);
            } else if (blockType !== 'none') {
                drawBlock(gridX, gridY, blockType);
            }

            // Check additional cells to make the line 20% wider
            const offsets = [
                { dx: 0.2, dy: 0 }, { dx: -0.2, dy: 0 }, // 20% offset horizontally
                { dx: 0, dy: 0.2 }, { dx: 0, dy: -0.2 }  // 20% offset vertically
            ];

            offsets.forEach(offset => {
                let adjustedX = x + offset.dx;
                let adjustedY = y + offset.dy;
                let adjustedGridX = Math.round(adjustedX);
                let adjustedGridY = Math.round(adjustedY);
                let adjustedBlockType = determineBlockType({x: adjustedX, y: adjustedY}, {x: nextX + offset.dx, y: nextY + offset.dy});
        
                console.log(`Adjusted Step ${step}: x=${adjustedX}, y=${adjustedY}, gridX=${adjustedGridX}, gridY=${adjustedGridY}, blockType=${adjustedBlockType}`);
        
                if (adjustedBlockType === 'stair') {
                    adjustedBlockType = determineStairBlockType({x: adjustedX, y: adjustedY}, {x: nextX + offset.dx, y: nextY + offset.dy});
                    drawBlock(adjustedGridX, adjustedGridY, adjustedBlockType);
                } else if (adjustedBlockType !== 'none') {
                    drawBlock(adjustedGridX, adjustedGridY, adjustedBlockType);
                }
            });
        }

        // Draw the debug line after the blocks and points to ensure it is on top
        ctx.beginPath();
        ctx.moveTo((curvePoints[0].x + 0.5) * (displayedWidth / gridSize), (curvePoints[0].y + 0.5) * (displayedHeight / gridSize));
        for (let i = 1; i < curvePoints.length; i++) {
            ctx.lineTo((curvePoints[i].x + 0.5) * (displayedWidth / gridSize), (curvePoints[i].y + 0.5) * (displayedHeight / gridSize));
        }
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();

        drawAllPoints();
    }
}

function drawAllPoints() {
    selectedPoints.forEach(point => {
        drawPixel(point.x, point.y, 'red');
    });
}

function drawPixel(x, y, color = 'red') {
    ctx.fillStyle = color;
    ctx.fillRect(x * (displayedWidth / gridSize), y * (displayedHeight / gridSize), displayedWidth / gridSize, displayedHeight / gridSize);
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < displayedWidth; x += displayedWidth / gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, displayedHeight);
        ctx.stroke();
    }
    for (let y = 0; y < displayedHeight; y += displayedHeight / gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayedWidth, y);
        ctx.stroke();
    }
    console.log("Grid drawn");
}

canvas.addEventListener('mousedown', (event) => {
    const pos = getMousePos(event);
    draggingPoint = selectedPoints.find(point => point.x === pos.x && point.y === pos.y);

    if (!draggingPoint && selectedPoints.length < (isCurvedLine ? 3 : 2)) {
        selectedPoints.push(pos);
        redrawCanvas();
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (draggingPoint) {
        const pos = getMousePos(event);
        const oldGridX = Math.floor(draggingPoint.x);
        const oldGridY = Math.floor(draggingPoint.y);
        draggingPoint.x = pos.x;
        draggingPoint.y = pos.y;
        const newGridX = Math.floor(draggingPoint.x);
        const newGridY = Math.floor(draggingPoint.y);
        
        if (newGridX !== oldGridX || newGridY !== oldGridY) {
            requestRedraw();
        }
    }
});

let isDrawing = false;

function requestRedraw() {
    if (!isDrawing) {
        isDrawing = true;
        requestAnimationFrame(() => {
            redrawCanvas();
            isDrawing = false;
        });
    }
}

canvas.addEventListener('mouseup', () => {
    draggingPoint = null;
});

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((event.clientX - rect.left) / (displayedWidth / gridSize)),
        y: Math.floor((event.clientY - rect.top) / (displayedHeight / gridSize))
    };
}

function redrawCanvas() {
    drawGrid();
    analyzeAndDrawBlocks();
    drawAllPoints();
}
