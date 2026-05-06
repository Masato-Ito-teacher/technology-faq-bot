// ==============================================================
// 技術科AIアシスタント - メイン処理
// ==============================================================

let currentCategory = "all";

// DOM要素を取得
const questionInput = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");
const answerArea = document.getElementById("answerArea");
const faqContainer = document.getElementById("faqContainer");
const categoryButtons = document.querySelectorAll(".category-btn");

// ========== 検索機能 ==========
/**
 * キーワード検索で最適な回答を見つける
 * 複数のキーワード に対応し、スコア計算で最適な答えを返す
 */
function findAnswer(query) {
  const normalized = query.trim().toLowerCase();
  
  if (!normalized) {
    return {
      title: "質問が入力されていません",
      text: "質問を入力してから検索ボタンを押してください。",
      category: ""
    };
  }

  // スコアを計算して最適なFAQを見つける
  let bestMatch = null;
  let bestScore = 0;

  faqList.forEach(item => {
    let score = 0;
    const queryWords = normalized.split(/\s+|、|。/);

    // キーワードマッチング
    item.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      queryWords.forEach(word => {
        if (word.length > 0) {
          // 完全一致：+5点
          if (keywordLower === word) score += 5;
          // 部分一致：+2点
          else if (keywordLower.includes(word) || word.includes(keywordLower)) score += 2;
        }
      });
    });

    // 質問文にもマッチングチェック
    const questionLower = item.question.toLowerCase();
    queryWords.forEach(word => {
      if (word.length > 0 && questionLower.includes(word)) {
        score += 1;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if (bestMatch && bestScore > 0) {
    return {
      title: bestMatch.question,
      text: bestMatch.answer,
      category: bestMatch.category
    };
  }

  return {
    title: "見つかりませんでした",
    text: "「すべてのFAQから探す」でカテゴリを選んで確認してみてください。わからないことは先生に質問しましょう！",
    category: ""
  };
}

/**
 * 回答をカード形式で表示
 */
function showAnswer(result) {
  document.getElementById("answerTitle").textContent = result.title;
  document.getElementById("answerText").textContent = result.text;
  
  const categoryDiv = document.getElementById("answerCategory");
  if (result.category) {
    categoryDiv.textContent = "📖 " + result.category;
    categoryDiv.style.display = "block";
  } else {
    categoryDiv.style.display = "none";
  }
  
  answerArea.classList.remove("hidden");
  answerArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ========== 検索ボタンのイベント ==========
sendButton.addEventListener("click", () => {
  const result = findAnswer(questionInput.value);
  showAnswer(result);
});

// Enterキーでも検索できるように
questionInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendButton.click();
  }
});

// ========== カテゴリフィルター機能 ==========
/**
 * カテゴリ別にFAQカードを生成・表示
 */
function displayFAQs(category) {
  faqContainer.innerHTML = "";
  
  let displayCount = 0;
  faqList.forEach((item, index) => {
    if (category === "all" || item.category === category) {
      const card = document.createElement("div");
      card.className = "faq-card";
      card.innerHTML = `
        <div class="faq-card-header">
          <h3>${item.question}</h3>
          <span class="faq-category-badge" data-category="${item.category}">${item.category}</span>
        </div>
        <p class="faq-answer">${item.answer}</p>
        <div class="faq-keywords">
          ${item.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join("")}
        </div>
      `;
      
      // カードをクリックすると回答を表示
      card.addEventListener("click", () => {
        showAnswer({
          title: item.question,
          text: item.answer,
          category: item.category
        });
      });
      
      faqContainer.appendChild(card);
      displayCount++;
    }
  });

  // 表示されたFAQの数を表示
  if (displayCount === 0) {
    const noResult = document.createElement("p");
    noResult.className = "no-result";
    noResult.textContent = "このカテゴリのFAQはまだありません。";
    faqContainer.appendChild(noResult);
  }
}

// カテゴリボタンのイベント
categoryButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    // アクティブボタンを更新
    categoryButtons.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    
    // カテゴリを更新して再表示
    currentCategory = e.target.dataset.category;
    displayFAQs(currentCategory);
  });
});

// ========== 初期化 ==========
// ページロード時に全FAQを表示
window.addEventListener("load", () => {
  displayFAQs("all");
});

