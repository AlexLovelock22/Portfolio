document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 50; // Number of grid cells per row/column
    const cellSize = 20; // Size of each cell in pixels
    const cellArea = cellSize * cellSize; // Area of a single cell



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

    let lastPositions = {
        point1: { x: 10, y: 10 },
        point2: { x: 40, y: 40 },
        ControlPoint: { x: 25, y: 25 }
    };

    // Create draggable points
    const points = [
        createDraggablePoint('point1', 10, 10, 'red'),
        createDraggablePoint('point2', 40, 40, 'blue'),
        createDraggablePoint('ControlPoint', 25, 25, 'green')
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

    function drawLines() {
    // Coordinates for points
    const p1X = parseInt(points[0].style.left) + 9;
    const p1Y = parseInt(points[0].style.top) + 9;
    const p2X = parseInt(points[1].style.left) + 9;
    const p2Y = parseInt(points[1].style.top) + 9;
    const controlX = parseInt(points[2].style.left) + 9;
    const controlY = parseInt(points[2].style.top) + 9;

    // Set line width for thickness
    const lineWidth = 10; // Set the line width to desired thickness
 

    

    // Mark cells touched by the lines and log coverage
    markAndLogIntersectedCells(p1X, p1Y, p2X, p2Y, controlX, controlY, lineWidth);

    // Reset the lineWidth if needed for other drawings
    ctx.lineWidth = 1; // Reset to default or another value if necessary
}

    const full = document.getElementById('full');
    const bottomSlab = document.getElementById('bottomSlab');
    const topSlab = document.getElementById('topSlab');
    const stairs1 = document.getElementById('stairs1');
    const stairs3 = document.getElementById('stairs2');
    const stairs2 = document.getElementById('stairs3'); // Good
    const stairs4 = document.getElementById('stairs4'); // Good 

    // Calculate the Bézier curve points
    function getBezierCurvePoints(p0, p1, p2, numPoints) {
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            let t = i / numPoints;
            let x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
            points.push({ x: x, y: y });
        }
        return points;
    }



    // Function to determine if a point is above the Bézier curve
    // Check if a point is above the curve
    function isPointAboveCurve(x, y, curvePoints) {
        for (let i = 0; i < curvePoints.length - 1; i++) {
            const cp1 = curvePoints[i];
            const cp2 = curvePoints[i + 1];
            if ((x > cp1.x && x <= cp2.x) || (x > cp2.x && x <= cp1.x)) {
                const slope = (cp2.y - cp1.y) / (cp2.x - cp1.x);
                const yOnLine = cp1.y + slope * (x - cp1.x);
                return y < yOnLine;
            }
        }
        return false;
    }

    function drawReferenceCurve(p1X, p1Y, controlX, controlY, p2X, p2Y) {
        ctx.beginPath();
        ctx.moveTo(p1X, p1Y);
        ctx.quadraticCurveTo(controlX, controlY, p2X, p2Y);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'; // Example color for reference curve
        ctx.lineWidth = 1; // Use a thin line for reference
        ctx.stroke();
    }
    

    function markAndLogIntersectedCells(p1X, p1Y, p2X, p2Y, controlX, controlY, dx, dy) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
        drawGrid(); // Redraw the grid
    
        console.clear(); // Clear previous logs
        console.log("Incoming data: ", p1X, p1Y, p2X, p2Y, controlX, controlY, dx, dy);
    
        // Bounding box of the shaded area
        const minX = Math.min(p1X - dx, p2X - dx, controlX - dx, p1X + dx, p2X + dx, controlX + dx);
        const maxX = Math.max(p1X - dx, p2X - dx, controlX - dx, p1X + dx, p2X + dx, controlX + dx);
        const minY = Math.min(p1Y + dy, p2Y + dy, controlY + dy, p1Y - dy, p2Y - dy, controlY - dy);
        const maxY = Math.max(p1Y + dy, p2Y + dy, controlY + dy, p1Y - dy, p2Y - dy, controlY - dy);
    
        console.log(`Bounding box: minX = ${minX}, maxX = ${maxX}, minY = ${minY}, maxY = ${maxY}`);
    
        // Create array to store cell types
        const cellTypes = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    
        drawReferenceCurve();
    
        // Get Bézier curve points for the center curve
        const numCurvePoints = 50; // Number of points to approximate the curve
        const centerCurvePoints = getBezierCurvePoints(
            { x: p1X, y: p1Y },
            { x: controlX, y: controlY },
            { x: p2X, y: p2Y },
            numCurvePoints
        );

        console.log("Generated Grid coordinates for blocks:", centerCurvePoints);

    
        // Calculate top and bottom curves using consistent normal vectors
        const topCurvePoints = [];
        const bottomCurvePoints = [];
        for (let i = 0; i < centerCurvePoints.length - 1; i++) {
            const point1 = centerCurvePoints[i];
            const point2 = centerCurvePoints[i + 1];
            const tangent = { x: point2.x - point1.x, y: point2.y - point1.y };
            const length = Math.hypot(tangent.x, tangent.y);
            const normal = { x: -tangent.y / length, y: tangent.x / length };
    
            // Apply a consistent offset for thickness
            const offset = dx; // Use dx as the desired thickness in pixels
            topCurvePoints.push({ x: point1.x + offset * normal.x, y: point1.y + offset * normal.y });
            bottomCurvePoints.push({ x: point1.x - offset * normal.x, y: point1.y - offset * normal.y });
        }
    
        // Combine top and bottom curve points for checking
        const allCurvePoints = topCurvePoints.concat(bottomCurvePoints);
    
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                const cellTopLeft = { x: x * cellSize, y: y * cellSize };
                const cellTopRight = { x: (x + 1) * cellSize, y: y * cellSize };
                const cellBottomLeft = { x: x * cellSize, y: (y + 1) * cellSize };
                const cellBottomRight = { x: (x + 1) * cellSize, y: (y + 1) * cellSize };
                const cellCenter = { x: (cellTopLeft.x + cellBottomRight.x) / 2, y: (cellTopLeft.y + cellBottomRight.y) / 2 };
    
                if (cellTopLeft.x > maxX || cellBottomRight.x < minX || cellTopLeft.y > maxY || cellBottomRight.y < minY) {
                    continue; // Skip cells outside the bounding box
                }
    
                // Calculate coverage percentage using Bézier curve points
                const coveragePercentage = calculateCoveragePercentage(
                    [cellTopLeft, cellTopRight, cellBottomRight, cellBottomLeft],
                    allCurvePoints
                );
    
                console.log(`Cell (${x}, ${y}) coveragePercentage: ${coveragePercentage}`);
    
                // Calculate the local gradient using the nearest points on the top and bottom curves
                let localGradient = 0;
                if (topCurvePoints.length > 1) {
                    const closestTopPoint = getClosestPointOnCurve(cellCenter, topCurvePoints);
                    const closestBottomPoint = getClosestPointOnCurve(cellCenter, bottomCurvePoints);
                    if (closestTopPoint && closestBottomPoint) {
                        localGradient = Math.abs((closestTopPoint.y - closestBottomPoint.y) / (closestTopPoint.x - closestBottomPoint.x));
                    }
                }
    
                // Check if the cell center is above or below the curve using the combined points
                const isAboveCentralLine = isPointAboveCurve(cellCenter.x, cellCenter.y, centerCurvePoints); // Corrected to use centerCurvePoints
                
                // Correct the isLeftOfLine calculation
                const isLeftOfLine = isPointLeftOfCurve(cellCenter.x, cellCenter.y, centerCurvePoints);
    
                if (coveragePercentage > 0) {
                    let imageToDraw = null;
                    let cellType = 'other';
    
                    // Determine the appropriate image based on local gradient, coverage, and position
                    if (coveragePercentage > 0 ) {
                        if (localGradient <= 20 && coveragePercentage <= 20 && localGradient > 1) {
                            // Horizontal or nearly horizontal
                            imageToDraw = isAboveCentralLine ? bottomSlab : topSlab;
                            cellType = 'slab';
                        } else if (localGradient < 30) {
                            // Vertical or nearly vertical
                            if (isAboveCentralLine) {
                                imageToDraw = isLeftOfLine ? stairs1 : stairs2;
                            } else {
                                imageToDraw = isLeftOfLine ? stairs3 : stairs4;
                            }
                            cellType = 'stairs';
                        } else {
                            imageToDraw = full;
                            cellType = 'block';
                        }
                    } else {
                        imageToDraw = full;
                        cellType = 'block';
                    }
    
                    cellTypes[x][y] = cellType;
    
                    if (imageToDraw) {
                        ctx.drawImage(imageToDraw, cellTopLeft.x, cellTopLeft.y, cellSize, cellSize);
                        console.log(`Drawing image at (${x}, ${y})`);
                    }
    
                    console.log(`Affected Cell: (${x}, ${y}) Coverage %: ${coveragePercentage.toFixed(2)}, Local Gradient: ${localGradient.toFixed(2)}, Above Central Line: ${isAboveCentralLine}, Left of Line: ${isLeftOfLine}`);
                }
            }
        }
    
        // Second pass to check and convert stairs to blocks if necessary
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (cellTypes[x][y] === 'stairs') {
                    console.log(`Checking adjacent cells for cell (${x}, ${y}) to determine if conversion to block is needed.`);
                    let adjacentBlocksCount = 0;
    
                    const adjacentCoords = [
                        [x - 1, y], [x + 1, y], // left, right
                        [x, y - 1], [x, y + 1]  // top, bottom
                    ];
    
                    adjacentCoords.forEach(([adjX, adjY]) => {
                        if (adjX >= 0 && adjY >= 0 && adjX < gridSize && adjY < gridSize) {
                            const adjCellType = cellTypes[adjX][adjY];
                            if (adjCellType === 'block' || adjCellType === 'slab' || adjCellType === 'stairs') {
                                console.log(`Adjacent block detected at (${adjX}, ${adjY}) with type: ${adjCellType}`);
                                adjacentBlocksCount++;
                            }
                        }
                    });
    
                    if (adjacentBlocksCount >= 3) {
                        cellTypes[x][y] = 'block';
                        console.log(`Converting cell (${x}, ${y}) from stairs to full block due to ${adjacentBlocksCount} adjacent blocks.`);
                        ctx.drawImage(full, x * cellSize, y * cellSize, cellSize, cellSize);
                    } else {
                        console.log(`Cell (${x}, ${y}) remains as stairs with ${adjacentBlocksCount} adjacent blocks.`);
                    }
                }
            }
        }
    }
    
    // Function to check if a point is left of the Bézier curve
    function isPointLeftOfCurve(x, y, curvePoints) {
        for (let i = 0; i < curvePoints.length - 1; i++) {
            const cp1 = curvePoints[i];
            const cp2 = curvePoints[i + 1];
            if ((y > cp1.y && y <= cp2.y) || (y > cp2.y && y <= cp1.y)) {
                const slope = (cp2.x - cp1.x) / (cp2.y - cp1.y);
                const xOnLine = cp1.x + slope * (y - cp1.y);
                return x < xOnLine;
            }
        }
        return false;
    }

    // Function to find the closest point on the curve to a given point
    function getClosestPointOnCurve(point, curvePoints) {
        let closestPoint = null;
        let minDistance = Infinity;
        for (const curvePoint of curvePoints) {
            const distance = Math.hypot(point.x - curvePoint.x, point.y - curvePoint.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = curvePoint;
            }
        }
        return closestPoint;
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

    const throttledDrawLines = throttle(drawLines, 1); // Adjust the limit as needed

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
