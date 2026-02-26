const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/bg-white\b/g, 'bg-[#FCFCFA]');
    content = content.replace(/bg-slate-50\b/g, 'bg-[#F9F8F6]');
    content = content.replace(/bg-neutral-950\b/g, 'bg-[#F9F8F6]');
    content = content.replace(/bg-neutral-900\b/g, 'bg-[#FCFCFA]');
    content = content.replace(/bg-neutral-800\b/g, 'bg-stone-200');
    content = content.replace(/bg-slate-100\b/g, 'bg-[#EFECE6]');
    content = content.replace(/bg-slate-200\b/g, 'bg-[#E5E2DC]');

    // Texts
    content = content.replace(/text-slate-900\b/g, 'text-stone-800');
    content = content.replace(/text-slate-800\b/g, 'text-stone-700');
    content = content.replace(/text-slate-700\b/g, 'text-stone-600');
    content = content.replace(/text-slate-600\b/g, 'text-stone-500');
    content = content.replace(/text-slate-500\b/g, 'text-stone-500');
    content = content.replace(/text-slate-400\b/g, 'text-stone-400');

    // Text neutrals (for un-migrated components like variables page)
    content = content.replace(/text-neutral-50\b/g, 'text-stone-800');
    content = content.replace(/text-neutral-100\b/g, 'text-stone-800');
    content = content.replace(/text-neutral-300\b/g, 'text-stone-600');
    content = content.replace(/text-neutral-400\b/g, 'text-stone-500');
    content = content.replace(/text-neutral-500\b/g, 'text-stone-500');

    // Borders
    content = content.replace(/border-slate-100\b/g, 'border-stone-200/50');
    content = content.replace(/border-slate-200\b/g, 'border-stone-200');
    content = content.replace(/border-neutral-800\b/g, 'border-stone-200');

    // Hover bg
    content = content.replace(/hover:bg-neutral-800\b/g, 'hover:bg-stone-50');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

function traverseDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // skip node_modules and .next
            if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
                traverseDir(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceColors(fullPath);
        }
    });
}

traverseDir(path.join(__dirname, 'src'));
