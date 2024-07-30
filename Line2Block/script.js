document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 50; // Number of grid cells per row/column
    const cellSize = 20; // Size of each cell in pixels
    const cellArea = cellSize * cellSize; // Area of a single cell

    let lastPositions = {
        point1: { x: 10, y: 10 },
        point2: { x: 40, y: 40 }
    };

    // Create grid container
    const gridContainer = document.createElement('div');
    document.body.appendChild(gridContainer);
    Object.assign(gridContainer.style, {
        position: 'relative',
        width: `${gridSize * cellSize}px`,
        height: `${gridSize * cellSize}px`,
        margin: 'auto',
        backgroundColor: '#fff',
        border: '1px solid #000'
    });

    // Create canvas for drawing grid and lines
    const canvas = document.createElement('canvas');
    gridContainer.appendChild(canvas);
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;
    const ctx = canvas.getContext('2d');

    const coordinateDisplay = document.createElement('div');
    coordinateDisplay.id = 'coordinate-display';
    gridContainer.appendChild(coordinateDisplay);

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);

        coordinateDisplay.textContent = `Grid Cell: (${gridX}, ${gridY})`;
    });

    canvas.addEventListener('mouseout', () => {
        coordinateDisplay.textContent = 'Hover over a cell';
    });

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ccc';
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
    }

    // Create draggable points
    const points = [
        createDraggablePoint('point1', 10, 10, 'red'),
        createDraggablePoint('point2', 40, 40, 'blue')
    ];

    function createDraggablePoint(id, initialX, initialY, color) {
        const point = document.createElement('div');
        gridContainer.appendChild(point);
        Object.assign(point.style, {
            width: '18px',
            height: '18px',
            backgroundColor: color, // Use the passed color
            borderRadius: '50%',
            position: 'absolute',
            cursor: 'grab',
            userSelect: 'none',
            left: `${initialX * cellSize + (cellSize - 18) / 2}px`,
            top: `${initialY * cellSize + (cellSize - 18) / 2}px`
        });

        point.onmousedown = (e) => {
            e.preventDefault();
            let shiftX = e.clientX - point.getBoundingClientRect().left;
            let shiftY = e.clientY - point.getBoundingClientRect().top;

            const moveAt = (pageX, pageY) => {
                let newLeft = pageX - shiftX - gridContainer.offsetLeft;
                let newTop = pageY - shiftY - gridContainer.offsetTop;

                newLeft = Math.max(0, Math.min(newLeft, canvas.width - cellSize));
                newTop = Math.max(0, Math.min(newTop, canvas.height - cellSize));

                let gridX = Math.round(newLeft / cellSize);
                let gridY = Math.round(newTop / cellSize);

                if (lastPositions[id].x !== gridX || lastPositions[id].y !== gridY) {
                    lastPositions[id] = { x: gridX, y: gridY };
                    point.style.left = `${gridX * cellSize + (cellSize - 18) / 2}px`;
                    point.style.top = `${gridY * cellSize + (cellSize - 18) / 2}px`;

                    throttledDrawLines();
                }
            };

            const onMouseMove = (event) => {
                moveAt(event.pageX, event.pageY);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                point.onmouseup = null;
            };
        };

        point.ondragstart = () => false;
        return point;
    }

    // Draw lines and shade between them, and mark intersected cells
    function drawLines() {
        drawGrid(); // Redraw grid to clear previous lines
        ctx.strokeStyle = 'blue';
        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'; // Light blue shade

        // Coordinates for points
        const p1X = parseInt(points[0].style.left) + 9;
        const p1Y = parseInt(points[0].style.top) + 9;
        const p2X = parseInt(points[1].style.left) + 9;
        const p2Y = parseInt(points[1].style.top) + 9;

        // Calculate angle between points
        const angle = Math.atan2(p2Y - p1Y, p2X - p1X);

        // Calculate offset positions for lines
        const offset = 10; // Adjust this value as needed for line thickness
        const dx = offset * Math.sin(angle);
        const dy = offset * Math.cos(angle);

        // Draw shaded area
        ctx.beginPath();
        ctx.moveTo(p1X - dx, p1Y + dy);
        ctx.lineTo(p2X - dx, p2Y + dy);
        ctx.lineTo(p2X + dx, p2Y - dy);
        ctx.lineTo(p1X + dx, p1Y - dy);
        ctx.closePath();
        ctx.fill();

        // Draw lines with calculated offsets
        ctx.beginPath();
        ctx.moveTo(p1X - dx, p1Y + dy); // Top line from point1
        ctx.lineTo(p2X - dx, p2Y + dy); // Top line to point2
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p1X + dx, p1Y - dy); // Bottom line from point1
        ctx.lineTo(p2X + dx, p2Y - dy); // Bottom line to point2
        ctx.stroke();

        // Mark cells touched by the lines and log coverage
        markAndLogIntersectedCells(p1X, p1Y, p2X, p2Y, dx, dy);
    }

    const full = document.getElementById('full');
    const bottomSlab = document.getElementById('bottomSlab');
    const topSlab = document.getElementById('topSlab');
    const stairs1 = document.getElementById('stairs1');
    const stairs3 = document.getElementById('stairs2');
    const stairs2 = document.getElementById('stairs3'); // Good
    const stairs4 = document.getElementById('stairs4'); // Good 

    function markAndLogIntersectedCells(p1X, p1Y, p2X, p2Y, dx, dy) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
        drawGrid(); // Redraw the grid
    
        console.clear(); // Clear previous logs
    
        // Shade the area between lines and the cells
        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'; // Light blue shade
        ctx.beginPath();
        ctx.moveTo(p1X - dx, p1Y + dy);
        ctx.lineTo(p2X - dx, p2Y + dy);
        ctx.lineTo(p2X + dx, p2Y - dy);
        ctx.lineTo(p1X + dx, p1Y - dy);
        ctx.closePath();
        ctx.fill();
    
        // Bounding box of the shaded area
        const minX = Math.min(p1X - dx, p2X - dx, p1X + dx, p2X + dx);
        const maxX = Math.max(p1X - dx, p2X - dx, p1X + dx, p2X + dx);
        const minY = Math.min(p1Y + dy, p2Y + dy, p1Y - dy, p2Y - dy);
        const maxY = Math.max(p1Y + dy, p2Y + dy, p1Y - dy, p2Y - dy);
    
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                // Define the corners of the current cell
                const cellTopLeft = { x: x * cellSize, y: y * cellSize };
                const cellTopRight = { x: (x + 1) * cellSize, y: y * cellSize };
                const cellBottomLeft = { x: x * cellSize, y: (y + 1) * cellSize };
                const cellBottomRight = { x: (x + 1) * cellSize, y: (y + 1) * cellSize };
                const cellCenter = { x: (cellTopLeft.x + cellBottomRight.x) / 2, y: (cellTopLeft.y + cellBottomRight.y) / 2 };
    
                // Check if the cell is within the bounding box of the shaded area
                if (cellTopLeft.x > maxX || cellBottomRight.x < minX || cellTopLeft.y > maxY || cellBottomRight.y < minY) {
                    continue; // Skip cells outside the bounding box
                }
    
                // Calculate the y-value of the line at the cell's x-coordinate
                const lineY = p1Y + ((cellCenter.x - p1X) * (p2Y - p1Y)) / (p2X - p1X);
                const isAboveCentralLine = cellCenter.y < lineY;
    
                // Calculate the x-value of the line at the cell's y-coordinate
                const lineX = p1X + ((cellCenter.y - p1Y) * (p2X - p1X)) / (p2Y - p1Y);
                const isLeftOfLine = cellCenter.x < lineX;
    
                // Calculate coverage percentage and gradient
                const coveragePercentage = calculateCoveragePercentage(
                    [cellTopLeft, cellTopRight, cellBottomRight, cellBottomLeft],
                    [{ x: p1X - dx, y: p1Y + dy }, { x: p2X - dx, y: p2Y + dy }, { x: p2X + dx, y: p2Y - dy }, { x: p1X + dx, y: p1Y - dy }]
                );
                const gradient = Math.abs(p2Y - p1Y) / Math.abs(p2X - p1X);
    
                let imageToDraw = null;
    
                // Set fill color and image based on position relative to the line
                if (coveragePercentage > 0) {
                    if (gradient <= 0.9 && coveragePercentage <= 20) {
                        // Choose images for slabs
                        imageToDraw = isAboveCentralLine ? bottomSlab : topSlab;
                        ctx.fillStyle = isAboveCentralLine ? 'rgba(255, 10, 0, 0)' : 'rgba(255, 165, 0, 0)';
                    } else if (gradient > 0.5 && coveragePercentage <= 20) {
                        // Choose images for stairs based on quadrants
                        if (isAboveCentralLine) {
                            imageToDraw = isLeftOfLine ? stairs1 : stairs2;
                            ctx.fillStyle = isLeftOfLine ? 'rgba(211, 211, 211, 0)' : 'rgba(105, 105, 105, 0)';
                        } else {
                            imageToDraw = isLeftOfLine ? stairs3 : stairs4;
                            ctx.fillStyle = isLeftOfLine ? 'rgba(238, 130, 238, 0)' : 'rgba(148, 0, 211, 0)';
                        }
                    } else {
                        imageToDraw = full
                        ctx.fillStyle = 'rgba(0, 255, 0, 0)'; // Light green shade for other coverage
                    }
    
                    // Draw the chosen image
                    if (imageToDraw) {
                        ctx.drawImage(imageToDraw, x * cellSize, y * cellSize, cellSize, cellSize);
                    }
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize); // Debugging color overlay
                }
    
                // Log the grid coordinates, coverage percentage, and position relative to the line
                console.log(`Affected Cell: (${x}, ${y}) Coverage %: ${coveragePercentage.toFixed(2)}, Gradient: ${gradient.toFixed(2)}, Above Central Line: ${isAboveCentralLine}, Left of Line: ${isLeftOfLine}`);
            }
        }
    }


    // Calculate the coverage percentage of a cell by the shaded area
    function calculateCoveragePercentage(cellVertices, shadedVertices) {
        // Calculate the intersection area between the cell and the shaded area
        const intersectionArea = calculatePolygonIntersectionArea(cellVertices, shadedVertices);
        return (intersectionArea / cellArea) * 100;
    }

    // Calculate the intersection area between two polygons
    function calculatePolygonIntersectionArea(polygon1, polygon2) {
        // Find the vertices of the intersection polygon
        const intersectionPoints = getIntersectionPoints(polygon1, polygon2);
        if (intersectionPoints.length > 2) {
            // Calculate the area of the intersection polygon
            return polygonArea(intersectionPoints);
        }
        return 0; // No intersection
    }

    // Get intersection points between two polygons
    function getIntersectionPoints(poly1, poly2) {
        const points = [];

        // Add points from poly1 inside poly2
        for (const p1 of poly1) {
            if (isPointInPolygon(p1.x, p1.y, poly2)) {
                points.push(p1);
            }
        }

        // Add points from poly2 inside poly1
        for (const p2 of poly2) {
            if (isPointInPolygon(p2.x, p2.y, poly1)) {
                points.push(p2);
            }
        }

        // Add intersection points between edges of poly1 and poly2
        for (let i = 0; i < poly1.length; i++) {
            const p1Start = poly1[i];
            const p1End = poly1[(i + 1) % poly1.length];
            for (let j = 0; j < poly2.length; j++) {
                const p2Start = poly2[j];
                const p2End = poly2[(j + 1) % poly2.length];
                const intersection = getLineIntersection(p1Start, p1End, p2Start, p2End);
                if (intersection) {
                    points.push(intersection);
                }
            }
        }

        // Remove duplicate points and sort by angle to ensure a correct polygon shape
        return points.filter((point, index, self) =>
            index === self.findIndex(p => p.x === point.x && p.y === point.y)
        ).sort((a, b) => Math.atan2(a.y - poly1[0].y, a.x - poly1[0].x) - Math.atan2(b.y - poly1[0].y, b.x - poly1[0].x));
    }

    // Check if a point is inside a polygon
    function isPointInPolygon(x, y, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;

            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Get intersection point between two line segments
    function getLineIntersection(p1Start, p1End, p2Start, p2End) {
        const s1_x = p1End.x - p1Start.x;
        const s1_y = p1End.y - p1Start.y;
        const s2_x = p2End.x - p2Start.x;
        const s2_y = p2End.y - p2Start.y;

        const s = (-s1_y * (p1Start.x - p2Start.x) + s1_x * (p1Start.y - p2Start.y)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = (s2_x * (p1Start.y - p2Start.y) - s2_y * (p1Start.x - p2Start.x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            // Intersection detected
            return {
                x: p1Start.x + (t * s1_x),
                y: p1Start.y + (t * s1_y)
            };
        }

        return null; // No intersection
    }

    // Calculate the area of a polygon
    function polygonArea(vertices) {
        let area = 0;
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            area += vertices[i].x * vertices[j].y;
            area -= vertices[j].x * vertices[i].y;
        }
        return Math.abs(area) / 2;
    }

    const throttledDrawLines = throttle(drawLines, 10); // Adjust the limit as needed

    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function () {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function () {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    drawGrid();
});
