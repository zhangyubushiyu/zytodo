const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const postcss = require('postcss');
const cssnano = require('cssnano');

async function build() {
    console.log('开始构建...');
    
    // 创建dist目录
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
    }
    
    // 压缩JavaScript文件
    console.log('压缩JavaScript文件...');
    const jsDir = path.join(__dirname, 'js');
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    
    for (const file of jsFiles) {
        const filePath = path.join(jsDir, file);
        const code = fs.readFileSync(filePath, 'utf8');
        
        try {
            const result = await minify(code);
            const distPath = path.join(__dirname, 'dist', 'js', file.replace('.js', '.min.js'));
            
            if (!fs.existsSync(path.dirname(distPath))) {
                fs.mkdirSync(path.dirname(distPath), { recursive: true });
            }
            
            fs.writeFileSync(distPath, result.code);
            console.log(`  - ${file} -> dist/js/${file.replace('.js', '.min.js')}`);
        } catch (error) {
            console.error(`  - 压缩 ${file} 失败:`, error.message);
        }
    }
    
    // 压缩CSS文件
    console.log('压缩CSS文件...');
    const cssDir = path.join(__dirname, 'css');
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    for (const file of cssFiles) {
        const filePath = path.join(cssDir, file);
        const css = fs.readFileSync(filePath, 'utf8');
        
        try {
            const result = await postcss([cssnano]).process(css, { from: undefined });
            const distPath = path.join(__dirname, 'dist', 'css', file.replace('.css', '.min.css'));
            
            if (!fs.existsSync(path.dirname(distPath))) {
                fs.mkdirSync(path.dirname(distPath), { recursive: true });
            }
            
            fs.writeFileSync(distPath, result.css);
            console.log(`  - ${file} -> dist/css/${file.replace('.css', '.min.css')}`);
        } catch (error) {
            console.error(`  - 压缩 ${file} 失败:`, error.message);
        }
    }
    
    console.log('构建完成！');
}

build().catch(console.error);
