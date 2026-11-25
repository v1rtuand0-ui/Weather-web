const HourlyChart = {
  // Hanya gambar kurva (dot sekarang ada di HTML slot)
  render(svgEl, slots) {
    if (!svgEl || slots.length < 2) {
      if (svgEl) svgEl.innerHTML = '';
      return;
    }

    const rect = svgEl.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 152;

    svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgEl.setAttribute('preserveAspectRatio', 'none');

    const temps = slots.map(s => s.temperature).filter(t => typeof t === 'number');
    if (!temps.length) { svgEl.innerHTML = ''; return; }

    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = (maxT - minT) || 1;

    const yTop = height * 0.48;
    const yBottom = height * 0.72;
    const n = slots.length;
    const stepX = width / n;

    const points = slots.map((slot, i) => {
      const t = typeof slot.temperature === 'number' ? slot.temperature : minT;
      return {
        x: stepX * (i + 0.5),
        y: yBottom - ((t - minT) / range) * (yBottom - yTop)
      };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    svgEl.innerHTML = '';
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    pathEl.setAttribute('stroke-width', '1.5');
    svgEl.appendChild(pathEl);
  }
};