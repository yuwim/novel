import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // createWebHistory 路由模式路径不带#号(生产环境下不能直接访问项目，需要 nginx 转发)
  // createWebHashHistory 路由模式路径带#号
  history: createWebHashHistory(), 
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login')
    },
    {
      path: '/feadback',
      name: 'feadback',
      component: () => import('@/views/FeadBack')
    },
    {
      path: '/news/:id',
      name: 'news',
      component: () => import('@/views/News')
    },
    {
      path: '/bookclass',
      name: 'bookclass',
      component: () => import('@/views/BookClass')
    },
    {
      path: '/book_rank',
      name: 'bookRank',
      component: () => import('@/views/BookRank')
    },
    {
      path: '/book/:id',
      name: 'book',
      component: () => import('@/views/Book')
	   
    },
    {
      path: '/chapter_list/:bookId',
      name: 'chapterList',
      component: () => import('@/views/ChapterList')
	   
    },
    {
      path: '/book/:id/:chapterId',
      name: 'bookContent',
      component: () => import('@/views/BookContent')
	   
    },
    {
      path: '/user/setup',
      name: 'userSetup',
      component: () => import('@/views/UserSetup')
    },
    {
      path: '/user/topup',
      name: 'userTopup',
      component: () => import('@/views/UserTopup')
    },
    {
      path: '/user/comment',
      name: 'userComment',
      component: () => import('@/views/UserComment')
	   
    },
    {
      path: '/user/bookshelf',
      name: 'userBookshelf',
      component: () => import('@/views/UserBookshelf')
    },
    {
      path: '/author/register',
      name: 'authorRegister',
      component: () => import('@/views/author/Register')
    },
    {
      path: '/author/book_list',
      name: 'authorBookList',
      component: () => import('@/views/author/BookList')
    },
    {
      path: '/author/book_add',
      name: 'authorBookAdd',
      component: () => import('@/views/author/BookAdd')
    },
    {
      path: '/author/chapter_list',
      name: 'authorChapterList',
      component: () => import('@/views/author/ChapterList')
    },
    {
      path: '/author/chapter_add',
      name: 'authorChapterAdd',
      component: () => import('@/views/author/ChapterAdd')
    },
    {
      path: '/author/chapter_update',
      name: 'authorChapterUpdate',
      component: () => import('@/views/author/ChapterUpdate')
    },
    {
      path: '/author/audit_feedback',
      name: 'authorAuditFeedback',
      component: () => import('@/views/author/AuditFeedback')
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/Layout'),
      children: [
        {
          path: '',
          name: 'adminDashboard',
          component: () => import('@/views/admin/Dashboard')
        },
        {
          path: 'book_manage',
          name: 'adminBookManage',
          component: () => import('@/views/admin/BookManage')
        },
        {
          path: 'book_audit',
          name: 'adminBookAudit',
          component: () => import('@/views/admin/BookAudit')
        },
        {
          path: 'console',
          name: 'adminConsole',
          component: () => import('@/views/admin/Console')
        },
        {
          path: 'comment_manage',
          name: 'adminCommentManage',
          component: () => import('@/views/admin/CommentManage')
        }
      ]
    }
  ]
})

// 解决 vue 中路由跳转时，总是从新页面中间开始显示
router.afterEach((to,from,next) => {
  window.scrollTo(0,0)
})

export default router