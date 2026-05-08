const postHeader = document.getElementById('post-header');
const postContent = document.getElementById('post-content');
const commentsContainer = document.getElementById('comments-container');

async function loadPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const file = urlParams.get('file');

  if (!file) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch(`pages/${file}`);
    if (!response.ok) throw new Error('Post not found');

    let content = await response.text();

    // Remove BOM if exists
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    parseAndRender(content);
    loadGiscus();

  } catch (error) {
    console.error('Failed to load post:', error);
    postHeader.innerHTML = '<h1>Post Not Found</h1>';
    postContent.innerHTML = '<p>The requested post could not be found.</p>';
  }
}

function parseAndRender(content) {
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  let metadata = {};
  let markdown = content;

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    markdown = frontMatterMatch[2];

    const lines = frontMatter.split(/\r?\n/);
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });
  }

  // Render Header
  const title = metadata.title || 'Untitled';
  const dateStr = metadata.date || new Date().toISOString().split('T')[0];
  const date = new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  let tagsHtml = '';
  if (metadata.tags && Array.isArray(metadata.tags)) {
    tagsHtml = metadata.tags.map(tag => `<span class="post-card-tag">${tag}</span>`).join('');
  }

  let imageHtml = '';
  if (metadata.image) {
    imageHtml = `<img src="${metadata.image}" alt="Cover Image" class="post-cover-image" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-top: 2rem; box-shadow: var(--glass-shadow);">`;
  }

  postHeader.innerHTML = `
    <h1 class="post-title">${title}</h1>
    <div class="post-meta">
      <span class="post-meta-date">${date}</span>
      <div class="post-meta-tags">${tagsHtml}</div>
    </div>
    ${imageHtml}
  `;

  document.title = `${title} - Erica's Blog`;

  // Parse Markdown
  if (window.marked) {
    postContent.innerHTML = marked.parse(markdown);
    if (window.Prism) {
      Prism.highlightAll();
    }
  } else {
    postContent.innerHTML = '<p>Error: Markdown parser not loaded.</p>';
  }
}

function loadGiscus() {
  if (!commentsContainer) return;

  // Clear existing script if any
  const existingScript = document.getElementById('giscus-script');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'giscus-script';
  script.src = 'https://giscus.app/client.js';

  // Replace with actual info later
  script.setAttribute('data-repo', 'signectionlab/signectionlab.github.io'); // 올바른 저장소 이름으로 수정했습니다.
  script.setAttribute('data-repo-id', 'R_kgDOSXYm8Q');
  script.setAttribute('data-category', 'General'); // 선택한 카테고리 이름
  script.setAttribute('data-category-id', 'DIC_kwDOSXYm8c4C8jgv');

  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '1');
  script.setAttribute('data-input-position', 'bottom');

  const isDark = document.body.classList.contains('theme-dark');
  script.setAttribute('data-theme', isDark ? 'dark' : 'light');

  script.setAttribute('data-lang', 'ko');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  commentsContainer.appendChild(script);
}

// Update Giscus theme when site theme changes
window.addEventListener('theme-changed', (e) => {
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;

  const theme = e.detail === 'dark' ? 'dark' : 'light';
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme } } },
    'https://giscus.app'
  );
});

if (postHeader && postContent) {
  loadPost();
}
