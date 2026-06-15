import re

def patch_file():
    path = "public/admin-dashboard.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # The goal is to compact the product_form_${idx} layout.
    
    # 1. Update the grid template columns and padding
    old_grid = 'id="product_form_${idx}" style="display: none; padding:2.5rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:3.5rem;'
    new_grid = 'id="product_form_${idx}" style="display: none; padding:1.5rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;'
    content = content.replace(old_grid, new_grid)

    # 2. Left column gap
    old_left_col = '<!-- Left Column: Details -->\n                <div style="display:flex; flex-direction:column; gap:1.8rem;">'
    new_left_col = '<!-- Left Column: Details -->\n                <div style="display:flex; flex-direction:column; gap:1.2rem;">'
    content = content.replace(old_left_col, new_left_col)

    # 3. Label styles (smaller margin-bottom)
    content = content.replace('margin-bottom:0.6rem;', 'margin-bottom:0.4rem;')
    
    # 4. Input paddings (reduce height)
    content = content.replace('padding:1rem 1.2rem;', 'padding:0.75rem 1rem;')
    
    # 5. Pricing gaps and padding
    content = content.replace('gap:1.2rem; background:rgba(255,255,255,0.02); padding:1.5rem;', 'gap:0.8rem; background:rgba(255,255,255,0.02); padding:1rem;')
    content = content.replace('padding:0.9rem; border-radius:8px;', 'padding:0.7rem; border-radius:6px;')
    
    # 6. Description height and padding
    content = content.replace('padding:1.2rem; border-radius:10px; min-height:140px;', 'padding:0.8rem 1rem; border-radius:8px; min-height:80px;')
    
    # 7. Images & Actions Right Column gaps
    old_right_col = '<!-- Right Column: Images & Action -->\n                <div style="display:flex; flex-direction:column; justify-content:space-between;">'
    new_right_col = '<!-- Right Column: Images & Action -->\n                <div style="display:flex; flex-direction:column; justify-content:space-between; gap:1.5rem;">'
    content = content.replace(old_right_col, new_right_col)
    
    # 8. Save button margin
    content = content.replace('margin-top:3rem;', 'margin-top:auto;')
    content = content.replace('padding:1.2rem 1.5rem;', 'padding:1rem 1.2rem;')
    content = content.replace('padding:1.2rem; font-size:1rem;', 'padding:1rem; font-size:0.95rem;')
    
    # 9. Media grid gap
    content = content.replace('grid-template-columns: 1fr 1fr; gap:1.5rem;', 'grid-template-columns: repeat(4, 1fr); gap:1rem;')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Patched admin-dashboard.html successfully.")

patch_file()
