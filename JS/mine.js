// - 変数 - //
var Run = true;
const canvas = document.getElementById('screen');
const Resetbutton = document.getElementById('Reset');
const Closebutton = document.getElementById('Close');
const dialog = document.getElementById('dialog');

const ctx = canvas.getContext('2d'); // コンテキストを取得
let turn = false; // フラグの初期化
let info; // info要素のための変数
let bombCount = 0; // 爆弾のカウント
let grid = []; // グリッドの状態を管理する配列
let startTime; // ゲーム開始時間を保持

// - 関数 - //
function drawRectangle(x, y, width, height) { // 四角形描画関数
    ctx.fillStyle = 'green'; // 塗りつぶし色
    ctx.fillRect(x, y, width, height); // 四角形を描く
    ctx.strokeStyle = 'white'; // 枠線の色
    ctx.strokeRect(x, y, width, height); // 枠線を描く
}

function drawTurnRectangle(x, y, width, height) { // Turn後の四角形描画関数
    ctx.fillStyle = 'gray'; // 塗りつぶし色
    ctx.fillRect(x, y, width, height); // 四角形を描く
    ctx.strokeStyle = 'white'; // 枠線の色
    ctx.strokeRect(x, y, width, height); // 枠線を描く
}

function drawBomb(x, y, width, height) { // 爆弾描画関数
    ctx.fillStyle = 'green'; // 塗りつぶし色
    ctx.fillRect(x, y, width, height); // 四角形を描く
    ctx.strokeStyle = 'white'; // 枠線の色
    ctx.strokeRect(x, y, width, height); // 枠線を描く
}

function drawTurnBomb(x, y, width, height) { // Turn後の爆弾を描く関数
    ctx.fillStyle = '#dc143c'; // 塗りつぶし色
    ctx.fillRect(x, y, width, height); // 四角形を描く
    ctx.strokeStyle = 'white'; // 枠線の色
    ctx.strokeRect(x, y, width, height); // 枠線を描く
}

function drawTile(x, y, width, height, count) { // タイル描画関数
    ctx.fillStyle = 'gray'; // 塗りつぶし色
    ctx.fillRect(x, y, width, height); // 四角形を描く
    ctx.strokeStyle = 'white'; // 枠線の色
    ctx.strokeRect(x, y, width, height); // 枠線を描く
    
    if (count > 0) {
        ctx.fillStyle = 'black'; // 数字の色
        ctx.font = '20px Arial';
        ctx.fillText(count, x + width / 2 - 5, y + height / 2 + 5); // タイルの中心に数字を描く
    }
}

// 爆弾の近接カウントを計算する関数
function calculateBombCounts() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (!grid[row][col].isBomb) {
                let count = 0;
                // 周囲の8マスをチェック
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue; // 自分自身はスキップ
                        const newRow = row + i;
                        const newCol = col + j;
                        // 範囲内かつ爆弾があるかを確認
                        if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
                            if (grid[newRow][newCol].isBomb) {
                                count++;
                            }
                        }
                    }
                }
                grid[row][col].bombCount = count; // タイルに爆弾数を記録
            }
        }
    }
}

// - メイン - //
window.onload = function() {
    startTime = new Date().getTime(); // ゲーム開始時の時間を記録
    // スクリーンの初期化
    canvas.width = 800;
    canvas.height = 650;
    
    // イベントの登録
    canvas.addEventListener('mousedown', mouseDown);

    // その他のエレメント関連
    info = document.getElementById('info');

    // 四角形の描写
    const rectWidth = 50; // 四角形の幅
    const rectHeight = 50; // 四角形の高さ
    const padding = 0; // 四角形間の隙間

    // グリッドの初期化
    for (let row = 0; row < 9; row++) {
        grid[row] = [];
        for (let col = 0; col < 9; col++) {
            grid[row][col] = { isBomb: false, isTurned: false, bombCount: 0 }; // セルの状態を初期化
        }
    }

    for (let row = 0; row < 9; row++) { // 9行
        for (let col = 0; col < 9; col++) { // 9列
            const x = col * (rectWidth + padding) + 155; // x座標
            const y = row * (rectHeight + padding) + 120; // y座標

            const rand = Math.floor(Math.random() * 6); // 0から5までのランダム数を生成

            switch (rand) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    drawRectangle(x, y, rectWidth, rectHeight); // 四角形を描く
                    break;

                case 5:
                    if (bombCount < 11) { // 爆弾の数を制限
                        drawBomb(x, y, rectWidth, rectHeight); // Bombを描く
                        grid[row][col].isBomb = true; // 爆弾があることを記録
                        bombCount++; // 爆弾のカウントを増やす
                    } else {
                        drawRectangle(x, y, rectWidth, rectHeight); // 四角形を描く
                    }
                    break;
            }
        }
    }

    // 爆弾の近接数を計算
    calculateBombCounts();
}

// - マウスクリック時の処理 - //
function mouseDown(event) {
    const rectWidth = 50; // 四角形の幅
    const rectHeight = 50; // 四角形の高さ
    const padding = 0; // 四角形間の隙間

    // クリック位置を取得
    const canvasRect = canvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    // 四角形の列と行を計算
    const col = Math.floor((x - 155) / (rectWidth + padding));
    const row = Math.floor((y - 120) / (rectHeight + padding));

    // クリックした場所が正しいか確認
    if (col >= 0 && col < 9 && row >= 0 && row < 9) {
        const rectX = col * (rectWidth + padding) + 155;
        const rectY = row * (rectHeight + padding) + 120;

        // セルの状態を確認
        if (Run === true) {
            if (!grid[row][col].isTurned) {
                if (grid[row][col].isBomb) {
                    drawTurnBomb(rectX, rectY, rectWidth, rectHeight); // 爆弾を描く
                    
                    dialog.style.display = 'block';
                    let endTime = new Date().getTime();
                    let elapsedTime = Math.floor((endTime - startTime) / 1000); // 経過時間を秒に変換
                    document.getElementById('now').innerHTML ="~GAME OVER~　" + "経過時間は " + elapsedTime + " 秒です"; // 経過時間を表示
                    
                    // ダイアログ表示時にボタンのイベントリスナーを設定
                    Resetbutton.addEventListener('click', function() {
                        window.location.href = 'file:///C:/Users/ict01/Documents/制作物/Mine.html'; // 遷移先のURL
                    });
                    Closebutton.addEventListener('click', function() {
                        window.location.href = 'file:///C:/Users/ict01/Documents/制作物/TOP.html';
                    });
                    
                    Run = false;

                } else {
                    drawTile(rectX, rectY, rectWidth, rectHeight, grid[row][col].bombCount); // 爆弾の数を描く
                    grid[row][col].isTurned = true; // セルの状態を更新
                    checkClear(); // クリア判定を呼び出す
                }
                turn = false; // ターンを終了
            }
        }
    }
}

// クリア判定の関数
function checkClear() {
    let allCleared = true;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // 非爆弾かつ未クリックのタイルを確認
            if (!grid[row][col].isBomb && !grid[row][col].isTurned) {
                allCleared = false;
                break;
            }
        }
        if (!allCleared) break;
    }

    // すべてクリアされた場合
    if (allCleared) {
        dialog.style.display = 'block';
        let endTime = new Date().getTime();
        let elapsedTime = Math.floor((endTime - startTime) / 1000); // 経過時間を秒に変換
        document.getElementById('now').innerHTML ="Clear!　" + "経過時間は " + elapsedTime + " 秒です"; // 経過時間を表示
            
        Resetbutton.addEventListener('click', function() {
            window.location.href = 'file:///C:/Users/ict01/Documents/制作物/Mine.html'; // 遷移先のURL
        });
        Closebutton.addEventListener('click', function() {
            window.location.href = 'file:///C:/Users/ict01/Documents/制作物/TOP.html';
        });
        Run = false;
    }
}
