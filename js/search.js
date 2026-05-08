let searchPosts = [];

async function fetchPostsForSearch() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Network response was not ok');
    searchPosts = await response.json();
  } catch (error) {
    console.error('Failed to fetch posts for search:', error);
  }
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const searchEvent = new CustomEvent('search-posts', { detail: searchTerm });
  window.dispatchEvent(searchEvent);
}

const searchInput = document.getElementById('search-input');
if (searchInput) {
  fetchPostsForSearch();
  searchInput.addEventListener('input', handleSearch);
}
