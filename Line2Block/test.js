for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                // Define the corners of the current cell
                const cellTopLeft = { x: x * cellSize, y: y * cellSize };
                const cellTopRight = { x: (x + 1) * cellSize, y: y * cellSize };
                const cellBottomLeft = { x: x * cellSize, y: (y + 1) * cellSize };
                const cellBottomRight = { x: (x + 1) * cellSize, y: (y + 1) * cellSize };

                // Check if the cell is within the bounding box of the shaded area
                if (cellTopLeft.x > maxX || cellBottomRight.x < minX || cellTopLeft.y > maxY || cellBottomRight.y < minY) {
                    continue; // Skip cells outside the bounding box
                }

                // Calculate coverage percentage and gradient
                const coveragePercentage = calculateCoveragePercentage(
                    [cellTopLeft, cellTopRight, cellBottomRight, cellBottomLeft],
                    [{ x: p1X - dx, y: p1Y + dy }, { x: p2X - dx, y: p2Y + dy }, { x: p2X + dx, y: p2Y - dy }, { x: p1X + dx, y: p1Y - dy }]
                );
                const gradient = Math.abs(p2Y - p1Y) / Math.abs(p2X - p1X);

                // Set fill color based on coverage and gradient
                if (coveragePercentage > 0) {
                    if (gradient <= 0.9 && coveragePercentage <= 20) {
                        ctx.fillStyle = 'rgba(255, 165, 0, 0.3)'; // Light orange shade for low coverage and low gradient
                    } else if (gradient > 1 && coveragePercentage <= 10) {
                        ctx.fillStyle = 'rgba(128, 0, 128, 0.3)'; // Purple shade for high coverage and high gradient
                    } else {
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Light green shade for other coverage
                    }
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }

                // Log the grid coordinates, coverage percentage, and gradient
                console.log(`Affected Cell: (${x}, ${y}) Coverage %: ${coveragePercentage.toFixed(2)}, Gradient: ${gradient.toFixed(2)}`);
            }
        }
    }