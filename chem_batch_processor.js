// chem_batch_processor.js - Batch processing module for multiple chemical reactions

class BatchReactionProcessor {
  constructor(equations, containerId) {
    this.equations = equations.filter(eq => eq.trim() !== '');
    this.container = document.getElementById(containerId);
    this.results = [];
    this.process();
  }

  process() {
    this.equations.forEach((eq, idx) => {
      try {
        const reaction = new ChemicalReaction(eq);
        this.results.push({
          index: idx,
          equation: eq,
          data: reaction.getTableData(),
          success: true
        });
      } catch (error) {
        this.results.push({
          index: idx,
          equation: eq,
          error: error.message,
          success: false
        });
      }
    });
    
    this.render();
  }

  render() {
    let html = `<div style="padding: 12px; background: #e6f7ff; border-radius: 6px; margin-bottom: 16px;">
      ✅ Оброблено <strong>${this.results.length}</strong> рівнянь | 
      <strong>${this.results.filter(r => r.success).length}</strong> успішно | 
      <strong>${this.results.filter(r => !r.success).length}</strong> з помилками
    </div>`;

    this.results.forEach((result) => {
      html += `<div style="margin-bottom: 24px; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
        <div style="margin-bottom: 8px;">
          <strong>Реакція ${result.index + 1}:</strong>
          <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${result.equation}</code>
        </div>`;

      if (result.success) {
        const balanceStatus = result.data.isBalanced ? 
          '<span style="color: green;">✅ Збалансоване</span>' : 
          '<span style="color: red;">❌ НЕ збалансоване</span>';
        html += `<div style="font-size: 12px; margin-bottom: 8px;">${balanceStatus}</div>`;
      } else {
        html += `<div style="color: red; font-size: 12px;">❌ Помилка: ${result.error}</div>`;
      }

      html += `</div>`;
    });

    if (this.container) {
      this.container.innerHTML = html;
    }
  }
}

window.BatchReactionProcessor = BatchReactionProcessor;