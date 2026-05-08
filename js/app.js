let appPosts = [];
let currentTag = null;
let currentSearchTerm = '';

const postsContainer = document.getElementById('posts-container');
const tagsContainer = document.getElementById('tags-container');

async function initApp() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) {
        if(response.status === 404) {
             postsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">posts.json is being generated or not found.</p>';
             return;
        }
        throw new Error('Network response was not ok');
    }
    appPosts = await response.json();
    renderTags();
    renderPosts();
  } catch (error) {
    console.error('Failed to init app:', error);
    if(postsContainer) {
        postsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">게시글을 불러오는데 실패했습니다.</p>';
    }
  }
}

function renderTags() {
  if (!tagsContainer) return;
  
  const tagsSet = new Set();
  appPosts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => tagsSet.add(tag));
    }
  });

  const tags = Array.from(tagsSet).sort();
  
  let html = `<button class="tag ${currentTag === null ? 'active' : ''}" data-tag="all">All</button>`;
  tags.forEach(tag => {
    html += `<button class="tag ${currentTag === tag ? 'active' : ''}" data-tag="${tag}">${tag}</button>`;
  });
  
  tagsContainer.innerHTML = html;

  tagsContainer.querySelectorAll('.tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tag = e.target.getAttribute('data-tag');
      currentTag = tag === 'all' ? null : tag;
      
      // Update active state
      tagsContainer.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      renderPosts();
    });
  });
}

function renderPosts() {
  if (!postsContainer) return;

  let filteredPosts = appPosts;

  // Filter by tag
  if (currentTag) {
    filteredPosts = filteredPosts.filter(post => 
      post.tags && post.tags.includes(currentTag)
    );
  }

  // Filter by search
  if (currentSearchTerm) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(currentSearchTerm) ||
      post.description.toLowerCase().includes(currentSearchTerm) ||
      (post.tags && post.tags.join(' ').toLowerCase().includes(currentSearchTerm))
    );
  }

  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">게시글이 없습니다.</p>';
    return;
  }

  let html = '';
  filteredPosts.forEach(post => {
    const date = new Date(post.date).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    let tagsHtml = '';
    if (post.tags && Array.isArray(post.tags)) {
      tagsHtml = post.tags.map(tag => `<span class="post-card-tag">${tag}</span>`).join('');
    }

    html += `
      <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card glass">
        <div class="post-card-date">${date}</div>
        <h2 class="post-card-title">${post.title}</h2>
        <p class="post-card-excerpt">${post.excerpt}</p>
        <div class="post-card-tags">${tagsHtml}</div>
      </a>
    `;
  });

  postsContainer.innerHTML = html;
}

window.addEventListener('search-posts', (e) => {
  currentSearchTerm = e.detail;
  renderPosts();
});

if (postsContainer) {
  initApp();
}
