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
    stairNorth: new Image(),
    stairEast: new Image(),
    stairSouth: new Image(),
    stairWest: new Image()
};

textures.full.src = 'BlockTextures/FullBlock.png';
textures.slabTop.src = 'BlockTextures/TopSlab.png';
textures.slabBottom.src = 'BlockTextures/BottomSlab.png';
textures.stairNorth.src = 'BlockTextures/Stairs1.png';
textures.stairEast.src = 'BlockTextures/Stairs2.png';
textures.stairSouth.src = 'BlockTextures/Stairs3.png';
textures.stairWest.src = 'BlockTextures/Stairs4.png';

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

    // Adjusted coverage thresholds
    if (coverage > 0.4) {  // Higher threshold for full blocks
        return 'full';
    } else if (coverage > 0.3) {  // Adjusted slab and stair threshold
        return slope > 0.4 ? 'stair' : 'slab';
    } else if (coverage > 0.2) {
        return 'slab';
    } else {
        return 'none';
    }
}


// Draw the block on the canvas
function drawBlock(x, y, blockType, orientation = '', debug = false) {
    if (debug) {
        // Draw debug grid cell overlay
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Semi-transparent red
        ctx.fillRect(x * (displayedWidth / gridSize), y * (displayedHeight / gridSize), displayedWidth / gridSize, displayedHeight / gridSize);
    }

    let texture;
    switch (blockType) {
        case 'full':
            texture = textures.full;
            break;
        case 'slab':
            texture = (y % 1 === 0) ? textures.slabBottom : textures.slabTop;
            break;
        case 'stair':
            texture = textures[`stair${orientation}`];
            break;
        default:
            return;
    }

    if (texture && texture.complete) {
        ctx.drawImage(texture, x * (displayedWidth / gridSize), y * (displayedHeight / gridSize), displayedWidth / gridSize, displayedHeight / gridSize);
    }
}

// Determine the orientation for stairs
function determineOrientation(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'East' : 'West';
    } else {
        return dy > 0 ? 'South' : 'North';
    }
}

// Analyze and draw blocks using a quadratic Bézier curve
function analyzeAndDrawBlocks() {
    if (selectedPoints.length === 3) {
        let [p1, p2, cp] = selectedPoints;

        let steps = 100; // Number of steps to approximate the curve
        ctx.beginPath();
        ctx.moveTo(p1.x * (displayedWidth / gridSize), p1.y * (displayedHeight / gridSize));

        for (let step = 0; step <= steps; step++) {
            let t = step / steps;

            // Quadratic Bezier Curve formula
            let x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cp.y + t * t * p2.y;

            let gridX = Math.floor(x);
            let gridY = Math.floor(y);

            // Center the curve within the grid cells
            let centerX = gridX + 0.5;
            let centerY = gridY + 0.5;

            // Draw the debug line
            ctx.lineTo(centerX * (displayedWidth / gridSize), centerY * (displayedHeight / gridSize));

            // Determine the block type for this segment
            let nextT = Math.min(1, t + 1 / steps);
            let nextX = (1 - nextT) * (1 - nextT) * p1.x + 2 * (1 - nextT) * nextT * cp.x + nextT * nextT * p2.x;
            let nextY = (1 - nextT) * (1 - nextT) * p1.y + 2 * (1 - nextT) * nextT * cp.y + nextT * nextT * p2.y;

            let blockType = determineBlockType({x: centerX, y: centerY}, {x: nextX, y: nextY});
            
            console.log(`Step ${step}: x=${centerX}, y=${centerY}, gridX=${gridX}, gridY=${gridY}, blockType=${blockType}`);

            if (blockType === 'stair') {
                let orientation = determineOrientation({x: x, y: y}, {x: nextX, y: nextY});
                drawBlock(gridX, gridY, blockType, orientation);
            } else if (blockType !== 'none') {
                drawBlock(gridX, gridY, blockType);
            }
        }

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    drawAllPoints();
}



function drawAllPoints() {
    selectedPoints.forEach(point => {
        drawPixel(point.x, point.y, 'red');
    });
}

function drawPixel(x, y, color = '#3498db') {
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
            redrawCanvas();
        }
    }
});

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
