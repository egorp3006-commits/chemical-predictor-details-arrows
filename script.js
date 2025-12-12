    const elements = ['Si', 'O', 'H', 'C', 'N'];

    const state = {
      coefficients: {},
      axisX: {},
      axisY: {}
    };

    elements.forEach(el => {
      state.coefficients[el] = 1;
      state.axisX[el] = false;
      state.axisY[el] = false;
    });

    function initializeTable() {
      const tableBody = document.getElementById('tableBody');
      tableBody.innerHTML = '';

      elements.forEach(el => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${el}</strong></td>
          <td>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value="${state.coefficients[el]}"
              data-element="${el}"
              class="coefficient-input"
            >
          </td>
          <td>
            <input 
              type="checkbox" 
              data-element="${el}"
              data-axis="x"
              class="axis-checkbox"
              ${state.axisX[el] ? 'checked' : ''}
            >
          </td>
          <td>
            <input 
              type="checkbox" 
              data-element="${el}"
              data-axis="y"
              class="axis-checkbox"
              ${state.axisY[el] ? 'checked' : ''}
            >
          </td>
        `;
        tableBody.appendChild(row);
      });

      attachTableListeners();
    }

    function attachTableListeners() {
      document.querySelectorAll('.coefficient-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const element = e.target.dataset.element;
          const value = parseInt(e.target.value) || 0;
          state.coefficients[element] = Math.max(1, value);
          e.target.value = state.coefficients[element];
          drawVectors();
        });
      });

      document.querySelectorAll('.axis-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const element = e.target.dataset.element;
          const axis = e.target.dataset.axis;

          if (axis === 'x') {
            state.axisX[element] = e.target.checked;
            if (e.target.checked && state.axisY[element]) {
              state.axisY[element] = false;
              document.querySelector(`input[data-element="${element}"][data-axis="y"]`).checked = false;
            }
          } else {
            state.axisY[element] = e.target.checked;
            if (e.target.checked && state.axisX[element]) {
              state.axisX[element] = false;
              document.querySelector(`input[data-element="${element}"][data-axis="x"]`).checked = false;
            }
          }

          drawVectors();
        });
      });
    }

    function drawVectors() {
      const canvas = document.getElementById('vectorCanvas');
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const gridSize = size / 11;
      const offset = gridSize;

      ctx.clearRect(0, 0, size, size);

      // Draw grid
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(offset + i * gridSize, offset);
        ctx.lineTo(offset + i * gridSize, size - offset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(offset, offset + i * gridSize);
        ctx.lineTo(size - offset, offset + i * gridSize);
        ctx.stroke();
      }

      // Draw axes
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(offset, offset);
      ctx.lineTo(offset, size - offset);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offset, size - offset);
      ctx.lineTo(size - offset, size - offset);
      ctx.stroke();

      // Draw axis labels
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('10', offset + 10 * gridSize, size - offset + 20);
      ctx.textAlign = 'right';
      ctx.fillText('10', offset - 10, offset);

      // Draw vectors
      Object.entries(state.coefficients).forEach(([element, coeff]) => {
        const isX = state.axisX[element];
        const isY = state.axisY[element];

        if (!isX && !isY) return;

        const color = colors[element];
        const startX = offset;
        const startY = size - offset;

        let endX, endY;

        if (isX) {
          endX = offset + coeff * gridSize;
          endY = startY;
        } else {
          endX = startX;
          endY = startY - coeff * gridSize;
        }

        // Draw vector line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const headlen = 15;
        const angle = Math.atan2(endY - startY, endX - startX);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // Draw label
        const labelX = (startX + endX) / 2 + 15;
        const labelY = (startY + endY) / 2 - 10;
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${element} = ${coeff}`, labelX, labelY);
      });
    }

    function generateCode() {
      const vectors = {};
      Object.entries(state.coefficients).forEach(([element, coeff]) => {
        const isX = state.axisX[element];
        const isY = state.axisY[element];
        if (isX || isY) {
          vectors[element] = {
            coefficient: coeff,
            direction: isX ? 'x' : 'y'
          };
        }
      });

      const code = `
// Vector Definitions
${Object.entries(vectors).map(([element, data]) => {
        return `const ${element} = new Vector(${data.direction === 'x' ? data.coefficient : 0}, ${data.direction === 'y' ? data.coefficient : 0});`;
      }).join('\n')}

// Vector Class (if needed)
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  
  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }
  
  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
}
      `.trim();

      document.getElementById('codeOutput').textContent = code;
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      initializeTable();
      drawVectors();
    });
  </script>
</body>
</html>
```

This vector visualization tool allows you to:

- **Add/Remove Vectors**: Use the checkboxes to add or remove vectors from the visualization
- **Set Coefficients**: Adjust the magnitude of each vector from 1 to 10
- **Choose Direction**: Select either X-axis or Y-axis for each vector (mutually exclusive)
- **View Visualization**: See your vectors drawn on a coordinate grid with proper arrowheads and labels
- **Generate Code**: Get JavaScript code that implements your vector definitions with a basic Vector class

The tool prevents selecting both X and Y axes simultaneously for the same vector, ensuring clear directional representation.