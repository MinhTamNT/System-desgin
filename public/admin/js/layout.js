/**
 * Layout chung cho tất cả các trang Admin
 */
document.addEventListener('DOMContentLoaded', function() {
    initLayout();
  });
  
  function initLayout() {
    createTailwindConfig();
    loadFonts();
    renderSidebar();
  }
  
  function createTailwindConfig() {
    // Thêm cấu hình Tailwind để hỗ trợ font và màu sắc
    const tailwindScript = document.createElement('script');
    tailwindScript.textContent = `
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              poppins: ['Poppins', 'sans-serif'],
            },
            colors: {
              primary: {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#8b5cf6',
                600: '#7c3aed',
                700: '#6d28d9',
                800: '#5b21b6',
                900: '#4c1d95',
              },
            },
          },
        },
      }
    `;
    document.head.appendChild(tailwindScript);
  }
  
  function loadFonts() {
    // Thêm Google Fonts nếu chưa có
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Poppins"]')) {
      const preconnectGoogle = document.createElement('link');
      preconnectGoogle.rel = 'preconnect';
      preconnectGoogle.href = 'https://fonts.googleapis.com';
      
      const preconnectGstatic = document.createElement('link');
      preconnectGstatic.rel = 'preconnect';
      preconnectGstatic.href = 'https://fonts.gstatic.com';
      preconnectGstatic.crossOrigin = 'anonymous';
      
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
      
      document.head.appendChild(preconnectGoogle);
      document.head.appendChild(preconnectGstatic);
      document.head.appendChild(fontLink);
    }
  }
  
  function renderSidebar() {
    // Xác định trang hiện tại
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Tạo sidebar HTML
    const sidebarHTML = `
      <aside class="sidebar w-72 bg-gray-900 text-gray-200 p-6 flex flex-col h-screen fixed shadow-xl z-10 overflow-y-auto">
        <div class="flex items-center justify-center mb-8">
          <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
            Admin Panel
          </h2>
        </div>
        <nav class="flex-grow">
          <ul>
            <li class="mb-3">
              <a
                href="./index.html"
                class="${currentPage === 'index.html' ? 'active-nav-item' : ''} flex items-center py-3 px-4 rounded-lg ${currentPage !== 'index.html' ? 'hover:bg-gray-800' : ''} transition duration-300"
              >
                <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </a>
            </li>
            <li class="mb-3">
              <a
                href="./user.html"
                class="${currentPage === 'user.html' ? 'active-nav-item' : ''} flex items-center py-3 px-4 rounded-lg ${currentPage !== 'user.html' ? 'hover:bg-gray-800' : ''} transition duration-300"
              >
                <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                User Management
              </a>
            </li>
            <li class="mb-3">
              <a
                href="./project.html"
                class="${currentPage === 'project.html' ? 'active-nav-item' : ''} flex items-center py-3 px-4 rounded-lg ${currentPage !== 'project.html' ? 'hover:bg-gray-800' : ''} transition duration-300"
              >
                <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Projects
              </a>
            </li>
            <li class="mb-3">
              <a
                href="./inviation.html"
                class="${currentPage === 'inviation.html' ? 'active-nav-item' : ''} flex items-center py-3 px-4 rounded-lg ${currentPage !== 'inviation.html' ? 'hover:bg-gray-800' : ''} transition duration-300"
              >
                <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Invitations
              </a>
            </li>
            <li class="mb-3">
              <a
                href="./notification.html"
                class="${currentPage === 'notification.html' ? 'active-nav-item' : ''} flex items-center py-3 px-4 rounded-lg ${currentPage !== 'notification.html' ? 'hover:bg-gray-800' : ''} transition duration-300"
              >
                <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                Notifications
              </a>
            </li>
            <li class="mb-3">
              <a
                href="./login.html"
                class="${currentPage === 'login.html' ? 'active-nav-item' : ''} flex items-center py-3 px-4 rounded-lg ${currentPage !== 'login.html' ? 'hover:bg-gray-800' : ''} transition duration-300"
              >
                <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </a>
            </li>
          </ul>
        </nav>
        <div class="mt-auto pt-6 border-t border-gray-700">
          <p class="text-sm text-gray-400 text-center">
            &copy; 2024 Pixel App
          </p>
        </div>
      </aside>
    `;
    
    // Tìm và thay thế sidebar hiện tại
    const existingSidebar = document.querySelector('aside.sidebar');
    if (existingSidebar) {
      existingSidebar.outerHTML = sidebarHTML;
    } else {
      // Nếu không tìm thấy sidebar, chèn vào phần đầu body
      const bodyFirstChild = document.body.firstChild;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sidebarHTML;
      document.body.insertBefore(tempDiv.firstChild, bodyFirstChild);
    }
    
    // Thêm class cho body nếu chưa có
    document.body.classList.add('bg-gray-50', 'min-h-screen', 'flex', 'font-poppins');
    
    // Đảm bảo div chính có margin-left phù hợp
    let mainContent = document.querySelector('.flex-1');
    if (mainContent) {
      mainContent.classList.remove('ml-64');
      mainContent.classList.add('ml-72');
    }
  }