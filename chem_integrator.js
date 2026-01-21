// chem_integrator.js
// Модуль для інтеграції парсера в твою систему

class ChemicalReaction {
  constructor(equationString) {
    this.original = equationString;
    this.parse();
  }

  parse() {
    // Викликаємо парсер з chem_parser.js
    this.elements = Elems_List(this.original);
    this.equationArray = Equation_Split(this.original);
    this.substArray = Subst_List(this.equationArray, this.elements);
    
    // Витягуємо корисні дані
    this.extractData();
  }

  extractData() {
    // Реактанти (ліва сторона)
    this.reactants = this.equationArray[1].slice(1).map((r, idx) => ({
      id: `r${idx}`,
      formula: r[1][0][0],           // оригінальна формула
      grossFormula: r[1][0][1],      // брутто формула
      coefficient: r[0]              // коефіцієнт
    }));

    // Продукти (права сторона)
    this.products = this.equationArray[2].slice(1).map((p, idx) => ({
      id: `p${idx}`,
      formula: p[1][0][0],
      grossFormula: p[1][0][1],
      coefficient: p[0]
    }));

    // Елементи та їх індекси
    this.elementMap = {};
    this.elements.forEach((elem, idx) => {
      if (idx > 0) {
        this.elementMap[elem] = {
          index: idx,
          name: elem,
          reactantCounts: [],
          productCounts: []
        };
      }
    });

    // Заповнюємо індекси для реактантів
    this.reactants.forEach((r, idx) => {
      for (let elemIdx = 1; elemIdx < this.substArray[idx + 1].length; elemIdx++) {
        const elemName = this.substArray[0][elemIdx];
        if (this.elementMap[elemName]) {
          this.elementMap[elemName].reactantCounts[idx] = 
            (this.substArray[idx + 1][elemIdx] || 0) * r.coefficient;
        }
      }
    });

    // Заповнюємо індекси для продуктів
    const reactantCount = this.reactants.length;
    this.products.forEach((p, idx) => {
      for (let elemIdx = 1; elemIdx < this.substArray[reactantCount + idx + 1].length; elemIdx++) {
        const elemName = this.substArray[0][elemIdx];
        if (this.elementMap[elemName]) {
          this.elementMap[elemName].productCounts[idx] = 
            (this.substArray[reactantCount + idx + 1][elemIdx] || 0) * p.coefficient;
        }
      }
    });
  }

  isBalanced() {
    // Перевіряємо, чи збалансована реакція
    for (const elem in this.elementMap) {
      const rSum = this.elementMap[elem].reactantCounts.reduce((a, b) => a + (b || 0), 0);
      const pSum = this.elementMap[elem].productCounts.reduce((a, b) => a + (b || 0), 0);
      if (rSum !== pSum) return false;
    }
    return true;
  }

  getTableData() {
    // Формуємо дані для таблиці
    const rows = [];
    
    for (const elem in this.elementMap) {
      const row = {
        element: elem,
        reactants: this.reactants.map((r, idx) => 
          this.elementMap[elem].reactantCounts[idx] || 0
        ),
        products: this.products.map((p, idx) => 
          this.elementMap[elem].productCounts[idx] || 0
        )
      };
      row.balance = row.reactants.reduce((a, b) => a + b, 0) - 
                    row.products.reduce((a, b) => a + b, 0);
      rows.push(row);
    }

    return {
      original: this.original,
      isBalanced: this.isBalanced(),
      reactants: this.reactants,
      products: this.products,
      elements: rows
    };
  }
}

// Експортуємо для використання
window.ChemicalReaction = ChemicalReaction;