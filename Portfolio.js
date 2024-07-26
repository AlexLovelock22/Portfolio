// // scripts.js
// document.addEventListener('DOMContentLoaded', () => {
//     const lightEffect = document.createElement('div');
//     lightEffect.className = 'light-effect';
//     document.body.appendChild(lightEffect);

//     document.addEventListener('mousemove', (e) => {
//         lightEffect.style.left = `${e.clientX}px`;
//         lightEffect.style.top = `${e.clientY}px`;
//     });
// });
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const points = [];
    const numPoints = 150;
    const maxVelocity = 0.5;
    const connectionRadius = 200;

    // Adjust canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create points with random positions and velocities
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * maxVelocity,
            vy: (Math.random() - 0.5) * maxVelocity
        });
    }

    // Update points' positions
    function updatePoints() {
        for (let point of points) {
            point.x += point.vx;
            point.y += point.vy;

            // Bounce off edges
            if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
            if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
        }
    }

    // Draw points and lines
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < points.length; i++) {
            let point = points[i];

            // Draw point
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(25, 44, 89, 0)';
            ctx.fill();

            // Find nearest points
            let nearestPoints = [];
            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    let otherPoint = points[j];
                    let distance = Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);
                    if (distance < connectionRadius) {
                        nearestPoints.push({ point: otherPoint, distance: distance });
                    }
                }
            }

            // Sort nearest points by distance and limit to 3 connections
            nearestPoints.sort((a, b) => a.distance - b.distance);
            nearestPoints = nearestPoints.slice(0, 3);

            // Draw lines to nearest points
            for (let k = 0; k < nearestPoints.length; k++) {
                let otherPoint = nearestPoints[k].point;
                let distance = nearestPoints[k].distance;
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(otherPoint.x, otherPoint.y);
                ctx.strokeStyle = `rgba(25, 44, 89, ${1 - distance / connectionRadius})`;
                ctx.stroke();
            }
        }
    }

    // Animation loop
    function animate() {
        updatePoints();
        draw();
        requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // // Light effect
    // const lightEffect = document.createElement('div');
    // lightEffect.className = 'light-effect';
    // document.body.appendChild(lightEffect);

    // document.addEventListener('mousemove', (e) => {
    //     lightEffect.style.left = `${e.clientX}px`;
    //     lightEffect.style.top = `${e.clientY}px`;
    // });
});


document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item a');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector('.menu-item.selected')?.classList.remove('selected');
            item.parentElement.classList.add('selected');
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item a');

    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            const offset = window.innerHeight * 0.2; // 20% of the viewport height

            window.scrollTo({
                top: targetElement.offsetTop - offset,
                behavior: 'smooth'
            });

            document.querySelector('.menu-item.selected')?.classList.remove('selected');
            item.parentElement.classList.add('selected');
        });
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator-dot');
    const carouselInner = document.querySelector('.carousel-inner');
    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
        carouselInner.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
        updateIndicators();
    }

    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function moveToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    function autoScroll() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => moveToSlide(index));
    });

    updateCarousel();
    setInterval(autoScroll, 3000); // Auto scroll every 3 seconds
});



document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main > section');
    const menuItems = document.querySelectorAll('.menu-item a');
    const offset = window.innerHeight * 0.6; // 20% of the viewport height

    window.addEventListener('scroll', () => {
        let currentSection = '';

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - offset;
            const sectionBottom = sectionTop + section.offsetHeight;


            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        // Special case for the very top of the page
        if (window.pageYOffset === 0) {
            currentSection = sections[0].getAttribute('id');
        }

        // Apply 'selected' class to the corresponding menu item
        menuItems.forEach(item => {
            item.parentElement.classList.remove('selected');
            if (item.getAttribute('href').substring(1) === currentSection) {
                item.parentElement.classList.add('selected');
                console.log(`Selecting menu item: ${item.getAttribute('href').substring(1)}`);
            }
        });
    });

    // Initial check in case the page loads in the middle of a section
    window.dispatchEvent(new Event('scroll'));
});
