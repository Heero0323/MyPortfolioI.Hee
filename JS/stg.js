// - 変数 - //
var Canvas;
var info;
var ctx;
var Run = true;
var mouse = new Point();
var fire = false;
var Chara_Shot_Count = 10;
var shotInterval = 500; // ショット間隔
var lastShotTime = 0; // 最後のショット時刻
var EnemyScore = 0;

var Enemy_Count = 4; // 敵機をX体に固定
var enemyShotCount = 30; // 敵機ショットの数
var counter = 0;
var position = new Point();
var i;
var j;

const Resetbutton = document.getElementById('Reset');
const Closebutton = document.getElementById('Close');
const dialog = document.getElementById('dialog');

// - クラス - //

// Point
function Point() {
    this.x = 0;
    this.y = 0;
}

Point.prototype.distance = function(other) {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
};

// Character
function Chara() {
    this.position = new Point();
    this.size = 30; // 自機のサイズ
    this.alive = true; // 自機の生存フラグ
}

Chara.prototype = {
    init: function(size) {
        this.size = size; // サイズ設定
    }
};

// 自機のショット
function Chara_Shot() {
    this.position = new Point();
    this.size = 5; // サイズを設定
    this.speed = 10; // スピードを設定
    this.alive = false; // 生存フラグ
}

Chara_Shot.prototype = {
    set: function(position, size, speed) {
        this.position.x = position.x + (size / 2) + 13;
        this.position.y = position.y;
        this.size = size;
        this.speed = speed;
        this.alive = true; // 生存フラグを立てる
    },

    move: function() {
        this.position.y -= this.speed; // 上に移動
        if (this.position.y < -this.size) {
            this.alive = false; // 画面外に出たら非表示
        }
    }
};

// 敵機のショット
function Enemy_Shot() {
    this.position = new Point();
    this.size = 5; // サイズ
    this.speed = 5; // スピード
    this.alive = false; // 生存フラグ
    this.direction = {x: 0, y: 0}; // 方向を追加
}

Enemy_Shot.prototype = {
    set: function(position, size, speed) {
        this.position.x = position.x;
        this.position.y = position.y;
        this.size = size;
        this.speed = speed;
        this.alive = true; // 生存フラグを立てる
    },

    move: function() {
        this.position.x += this.direction.x; // x方向に移動
        this.position.y += this.direction.y; // y方向に移動
        if (this.position.y > Canvas.height + this.size) {
            this.alive = false; // 画面外に出たら非表示
        }
    }
};

// スコアを表示する関数
function updateScoreDisplay() {
    const message = "あなたのスコアは " + EnemyScore + " です";
    document.getElementById("EnemyScore").innerHTML = message;
}

// Enemy
function Enemy(enemyShots) {
    this.position = new Point();
    this.size = 15; // 敵機のサイズ
    this.type = 0;
    this.speed = 2; // スピード
    this.alive = false;
    this.direction = "right"; // 初期方向
    this.enemyShots = enemyShots; // 敵機ショットの配列を保持
    this.respawnTime = 0; // 再生成までのカウントダウン
}

Enemy.prototype = {
    set: function(position, size, type) {
        this.position.x = position.x;
        this.position.y = position.y;
        this.size = size;
        this.alive = true; // 生存フラグを立てる
        this.type = type; // タイプを設定
        this.respawnTime = 0; // 再生成タイマーリセット
    },

    move: function() { // 敵機の動きのメソッド
        const speed = this.speed; // スピード

        // 左右に移動
        if (this.direction === "right") {
            this.position.x += speed;
            // 画面右端に移動したら折り返し
            if (this.position.x > Canvas.width - this.size) {
                this.direction = "left";
            }
        } else {
            this.position.x -= speed;
            // 画面左端に移動したら折り返し
            if (this.position.x < 0 + this.size) {
                this.direction = "right";
            }
        }
    },

    shoot: function(charaPosition) {
        for (let i = 0; i < enemyShotCount; i++) {
            if (!this.enemyShots[i].alive) {
                this.shootPattern(i, charaPosition); // 自機の位置を渡す
                break;
            }
        }
    },

    shootPattern: function(index, charaPosition) {
        const dx = charaPosition.x - this.position.x; // 自機とのx座標の差
        const dy = charaPosition.y - this.position.y; // 自機とのy座標の差
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // 距離が0の場合の処理を追加
        if (distance === 0) return; // 自機と同じ位置の場合は何もしない
    
        // 正規化して速度を設定
        const speed = 5; // 任意のスピード
        const normalizedDx = (dx / distance) * speed;
        const normalizedDy = (dy / distance) * speed;
    
        const patternType = Math.floor(Math.random() * 3); // 0, 1, 2 のいずれかをランダムに選択
    
        switch (patternType) {
            case 0: // タイプ0: プレイヤーの座標に発射
                this.enemyShots[index].set({x: this.position.x, y: this.position.y}, 5, speed);
                this.enemyShots[index].direction = {x: normalizedDx, y: normalizedDy}; // 方向を保存
                break;
    
            case 1: // タイプ1: 直進発射
            this.enemyShots[index].set({x: this.position.x, y: this.position.y}, 5, speed);
            this.enemyShots[index].direction = {x: 0, y: 3};
                break;
    
            case 2: // タイプ2: 散弾発射
            const numShots = 3; // 発射するショットの数
            const spreadAngle = 0.5; // 散弾の広がり具合
        
            for (let i = 0; i < numShots; i++) {
                let angleOffset = (i - Math.floor(numShots / 2)) * spreadAngle; // 散弾のオフセットを計算
                let shotIndex = this.enemyShots.findIndex(shot => !shot.alive);
                if (shotIndex !== -1) {
                    this.enemyShots[shotIndex].set({x: this.position.x, y: this.position.y}, 5, speed);
                    this.enemyShots[shotIndex].direction = {
                        x: normalizedDx + angleOffset,
                        y: normalizedDy
                    };
                }
            }
            break;
        }
    },
    

    respawn: function() {
        if (!this.alive) {
            this.respawnTime++; // タイマーを増加
            if (this.respawnTime > 180) { // 180フレーム後に再生成
                this.set({x: Math.random() * (Canvas.width - this.size), y: 50}, this.size, this.type);
            }
        }
    }
};

// - メイン - //
window.onload = function() {
    // スクリーンの初期化
    Canvas = document.getElementById('screen');
    Canvas.width = 800;
    Canvas.height = 650;
    ctx = Canvas.getContext('2d');

    // イベントの登録
    Canvas.addEventListener('mousemove', mouseMove);
    window.addEventListener('keydown', keyDown);
    Canvas.addEventListener('mousedown', mouseDown);
    Canvas.addEventListener('mouseup', mouseUp);

    // その他のエレメント関連
    info = document.getElementById('info');

    // 自機 初期化
    var chara = new Chara();
    chara.init(30);

    // 自機ショット 初期化
    var charaShot = new Array(Chara_Shot_Count);
    for (i = 0; i < Chara_Shot_Count; i++) {
        charaShot[i] = new Chara_Shot();
    }

    // 敵機ショット 初期化
    var enemyShots = new Array(enemyShotCount);
    for (i = 0; i < enemyShotCount; i++) {
        enemyShots[i] = new Enemy_Shot();
    }

    // 敵機 初期化
    var enemies = [];
    for (let k = 0; k < Enemy_Count; k++) {
        var enemy = new Enemy(enemyShots);
        position.x = Math.random() * (Canvas.width - 15); // ランダムな位置
        position.y = 50 + k * 50; // 上部
        enemy.set(position, 15, 0); // タイプ0で初期化
        enemies.push(enemy);
    }

    // 画面を繰り返し呼び出す
    (function loop() {
        // カウンタをインクリメント
        counter++;

        // screenクリア
        ctx.clearRect(0, 0, Canvas.width, Canvas.height);

        // 自機の位置を設定
        chara.position.x = Math.min(Math.max(mouse.x - (chara.size / 2), 0), Canvas.width - chara.size);
        chara.position.y = Math.min(Math.max(mouse.y - (chara.size / 2), 0), Canvas.height - chara.size);

        // 自機を描く
        ctx.fillStyle = "white";
        ctx.fillRect(chara.position.x, chara.position.y, chara.size, chara.size);

        // fireフラグ trueなら処理が進む
        if (fire) {
            var currentTime = Date.now();
            if (currentTime - lastShotTime > shotInterval) { // ショット間隔を確認
                // すべての自機ショットを調査する
                for (let i = 0; i < Chara_Shot_Count; i++) {
                    if (!charaShot[i].alive) {
                        charaShot[i].set(chara.position, 5, 10);
                        lastShotTime = currentTime; // 最後のショット時刻を更新
                        break;
                    }
                }
            }
        }

        // 自機ショットを描く
        for (i = 0; i < Chara_Shot_Count; i++) {
            if (charaShot[i].alive) {
                charaShot[i].move(); // 自機ショットを動かす
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(charaShot[i].position.x, charaShot[i].position.y, charaShot[i].size, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.closePath();
            }
        }

        // 敵機のショットを発射
        if (counter % 30 === 0) { // Xフレームごとに発射
            for (let enemy of enemies) {
                if (enemy.alive) {
                    enemy.shoot(chara.position); // 自機の位置を渡す
                }
            }
        }

        // 敵機の描画
        ctx.fillStyle = "green";
        for (let enemy of enemies) {
            if (enemy.alive) {
                enemy.move(); // 敵機の動きを呼び出す
                ctx.beginPath();
                ctx.arc(enemy.position.x, enemy.position.y, enemy.size, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.closePath();
            } else {
                enemy.respawn(); // 敵機の再生成
            }
        }

        // 敵機ショットの描画
        ctx.fillStyle = "yellow"; // 敵ショットの色
        for (i = 0; i < enemyShotCount; i++) {
            if (enemyShots[i].alive) {
                enemyShots[i].move(); // 敵ショットを動かす
                ctx.beginPath();
                ctx.arc(enemyShots[i].position.x, enemyShots[i].position.y, enemyShots[i].size, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.closePath();
            }
        }

        // 弾が当たった時の判定
        // 自機ショットの判定
        for (i = 0; i < Chara_Shot_Count; i++) {
            if (charaShot[i].alive) {
                // 自機ショットと敵機の当たり判定
                for (let enemy of enemies) {
                    if (enemy.alive) {
                        const p = enemy.position.distance(charaShot[i].position);
                        if (p < enemy.size) {
                            enemy.alive = false; // 敵機が破壊
                            charaShot[i].alive = false; // 自機ショットを無効
                            EnemyScore++;
                            
                                break;
                        }
                    }
                }
            }
        }

        // 自機と敵機ショットの当たり判定
        for (i = 0; i < enemyShotCount; i++) {
            if (enemyShots[i].alive) {
                const p = enemyShots[i].position.distance(chara.position);
                if (p < chara.size) {
                    Run = false;
                    dialog.style.display = 'block';
                    Resetbutton.addEventListener('click', function() {
                        window.location.href = "Game.html"; // 遷移先のURL
                    });
                    Closebutton.addEventListener('click', function() {
                        window.location.href = "index.html";
                    });
                    document.getElementById('gameOverScore').innerHTML = "あなたの撃破数は " + EnemyScore + " です"; // スコアを表示
                }
            }
        }

        // 再帰呼び出し
        if (Run) {
            requestAnimationFrame(loop);
        }
    })();
};

// 関数
function mouseMove(event) {
    var rect = Canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    info.style.color = "white"; // ここで色を変更
}

function keyDown(event) {
    if (event.key === " ") {
        Run = false; // spaceキーで停止
    }
}

function mouseDown(event) {
    fire = true; // フラグを立てる

    // ダイアログ表示時にボタンのイベントリスナーを設定
    Resetbutton.addEventListener('click', function() {
        window.location.href = "Game.html"; // 遷移先のURL
    });
    Closebutton.addEventListener('click', function() {
        window.location.href = "index.html";
    });
}

function mouseUp(event) {
    fire = false; // フラグを下げる
}
